#!/usr/bin/env node

import { program } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import GPXParser from 'gpxparser';
import chalk from 'chalk';
import readline from 'readline';
import path from 'path';

const execAsync = promisify(exec);

// Store running simulations
const runningSimulations = new Map();

// Setup readline interface for keyboard input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get list of available simulators
async function getSimulators() {
    try {
        const { stdout } = await execAsync('xcrun simctl list devices');
        return stdout
            .split('\n')
            .filter(line => line.includes('Booted'))
            .map(line => {
                const match = line.match(/\(([A-F0-9-]+)\)/);
                return match ? match[1] : null;
            })
            .filter(Boolean);
    } catch (error) {
        console.error(chalk.red('Error getting simulators:'), error.message);
        return [];
    }
}

// Function to stop location simulation for a simulator
async function stopLocationSimulation(simulatorId) {
    try {
        await execAsync(`xcrun simctl location ${simulatorId} clear`);
        runningSimulations.delete(simulatorId);
        console.log(chalk.green(`Stopped location simulation for simulator ${simulatorId}`));
        return true;
    } catch (error) {
        console.error(
            chalk.red(`Error stopping location simulation for simulator ${simulatorId}:`),
            error.message
        );
        return false;
    }
}

// Function to stop all running simulations
async function stopAllSimulations() {
    const simulators = await getSimulators();
    for (const simulatorId of simulators) {
        await stopLocationSimulation(simulatorId);
    }
    console.log(chalk.yellow('\nSimulation stopped.'));
    process.exit(0);
}

// Function to set location for a simulator
async function setLocation(simulatorId, latitude, longitude) {
    try {
        await execAsync(
            `xcrun simctl location ${simulatorId} set ${latitude},${longitude}`
        );
        return true;
    } catch (error) {
        console.error(
            chalk.red(`Error setting location for simulator ${simulatorId}:`),
            error.message
        );
        return false;
    }
}

// Function to set location route for a simulator
async function setLocationRoute(simulatorId, points, speed, interval) {
    try {
        // Stop any existing simulation first
        if (runningSimulations.has(simulatorId)) {
            await stopLocationSimulation(simulatorId);
        }

        // Convert points to the format expected by the start command
        const waypoints = points.map(point => `${point.lat},${point.lon}`).join(' ');
        
        // Build the command with speed and interval parameters
        const command = `xcrun simctl location ${simulatorId} start --speed=${speed} --interval=${interval} ${waypoints}`;
        
        console.log(chalk.green(`Starting location simulation for simulator ${simulatorId}`));
        await execAsync(command);
        runningSimulations.set(simulatorId, true);
        return true;
    } catch (error) {
        console.error(
            chalk.red(`Error setting location route for simulator ${simulatorId}:`),
            error.message
        );
        return false;
    }
}

// Function to parse GPX file and return track points
async function parseGPX(fileName) {
    try {
        const gpxData = await readFile(path.join(process.cwd(), 'gpx', fileName), 'utf-8');
        const gpx = new GPXParser();
        gpx.parse(gpxData);
        return gpx.tracks[0].points;
    } catch (error) {
        console.error(chalk.red('Error parsing GPX file:'), error.message);
        return [];
    }
}

// Function to load route configuration
async function loadRouteConfig(routeName) {
    try {
        const configPath = path.join(process.cwd(), 'routes', `${routeName}.json`);
        const configData = await readFile(configPath, 'utf-8');
        return JSON.parse(configData);
    } catch (error) {
        console.error(chalk.red(`Error loading route configuration for ${routeName}:`), error.message);
        return null;
    }
}

// Main program setup
program
    .name('ios-simulator-location-route-runner')
    .description('Set iOS Simulator locations from GPX files')
    .version('1.0.0')
    .requiredOption('-r, --route <name>', 'Name of the route configuration to use')
    .option('-s, --speed <m/s>', 'Speed of movement in meters per second', '20')
    .option('-i, --interval <s>', 'Interval between location updates in seconds', '1.0')
    .action(async (options) => {
        const routeConfig = await loadRouteConfig(options.route);
        
        if (!routeConfig) {
            console.error(chalk.red(`Route configuration not found: ${options.route}`));
            process.exit(1);
        }

        const simulators = await getSimulators();
        
        if (simulators.length === 0) {
            console.error(chalk.red('No booted simulators found'));
            process.exit(1);
        }

        // Set initial location for all simulators
        console.log(chalk.green(`Setting initial location for all simulators`));
        for (const simulatorId of simulators) {
            await setLocation(
                simulatorId,
                routeConfig.startingPoint.latitude,
                routeConfig.startingPoint.longitude
            );
        }

        const points = await parseGPX(routeConfig.gpxFile);
        
        if (points.length === 0) {
            console.error(chalk.red('No track points found in GPX file'));
            process.exit(1);
        }

        console.log(chalk.green(`Found ${points.length} track points`));
        console.log(chalk.green(`Starting location simulation for ${simulators.length} simulators`));
        console.log(chalk.yellow('Press ESC to stop the simulation'));

        // Start location simulation for each simulator
        for (const simulatorId of simulators) {
            await setLocationRoute(
                simulatorId,
                points,
                options.speed,
                options.interval
            );
        }

        // Handle keyboard input
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', async (data) => {
            const key = data.toString();
            if (key === '\u001b') { // ESC key
                await stopAllSimulations();
            }
        });
    });

program.parse(); 