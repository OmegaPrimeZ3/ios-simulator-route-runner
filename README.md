# iOS Simulator Location Route Runner

A command-line tool that sets iOS Simulator locations from GPX files. This tool is particularly useful for testing location-based features in React Native and Expo applications, where the built-in Xcode location simulation capabilities may not be sufficient.

## Why Use This Tool?

### React Native & Expo Development
When developing React Native or Expo applications that use location services, you might find that:
- The built-in Xcode location simulation doesn't always trigger React Native's location events
- You need to test complex location-based features like geofencing or route tracking
- You want to simulate real-world movement patterns for testing navigation features
- You need to test location updates across multiple simulators simultaneously

### Key Benefits
- **Consistent Location Updates**: Ensures reliable triggering of location events in React Native/Expo apps
- **Real-world Testing**: Use actual GPX routes from real-world activities for testing
- **Multi-simulator Support**: Test location features across multiple simulators simultaneously
- **Automated Testing**: Easily integrate into your testing workflow
- **Customizable Speed**: Adjust movement speed to test different scenarios (walking, running, driving)

## Prerequisites

- Node.js (v14 or higher)
- Xcode Command Line Tools
- At least one running iOS Simulator

## Installation

1. Clone this repository
2. Install dependencies:
```bash
yarn install
```

## Project Structure

```
.
├── gpx/                  # GPX route files
│   └── disney-lands-walk.gpx
├── routes/               # Route configuration files
│   └── disney-lands-walk.json
├── src/                  # Source code
│   └── index.js         # Main application entry point
├── .vscode/             # VS Code configuration
│   └── launch.json
└── package.json
```

## Dependencies

- `chalk`: For colorful console output
- `commander`: For command-line argument parsing
- `gpxparser`: For parsing GPX route files

## Usage

### Running the Application

Run the tool with a route configuration:

```bash
yarn start --route <route-name> [options]
```

### Options

- `-r, --route <name>`: Name of the route configuration to use (required)
- `-s, --speed <m/s>`: Speed of movement in meters per second (default: 20)
- `-i, --interval <s>`: Interval between location updates in seconds (default: 1.0)

### Example

```bash
yarn start --route disney-lands-walk --speed 1.4 --interval 1.0
```

This will update the location of all running simulators using the track points from the GPX file specified in the route configuration.

## Route Configuration

Route configurations are stored in JSON files in the `routes` directory. Each configuration file should have the following structure:

```json
{
    "name": "Route Name",
    "description": "Route description",
    "gpxFile": "path/to/route.gpx",
    "startingPoint": {
        "latitude": 33.8121,
        "longitude": -117.9190
    }
}
```

### Adding New Routes

1. Place your GPX file in the `gpx` directory
2. Create a corresponding JSON configuration file in the `routes` directory
3. Reference the GPX file path relative to the `gpx` directory in your configuration

## Debugging

### VS Code Debugging

1. Open the project in VS Code
2. Go to the Debug panel (Ctrl+Shift+D or Cmd+Shift+D)
3. Select "Debug Location Runner" from the dropdown
4. Click the green play button or press F5

### Debug Script

You can also use the debug script:

```bash
yarn debug --route <route-name> [options]
```

## Controls

- Press `ESC` to stop the simulation
- The simulation will automatically set the initial location for all simulators before starting the route

## Notes

- The tool will automatically detect all running simulators
- Location updates will continue until you stop the program (ESC key)
- The route will loop continuously through all track points
- Each simulator will start at the configured starting point before beginning the route

## Common Use Cases

### React Native Location Testing
- Testing `react-native-maps` components with real-world routes
- Verifying geofencing functionality
- Testing location-based notifications
- Simulating user movement patterns

### Expo Development
- Testing Expo Location API functionality
- Verifying background location updates
- Testing location-based features in Expo Go
- Simulating real-world navigation scenarios

### Testing Scenarios
- Walking routes (1-2 m/s)
- Running routes (2-4 m/s)
- Driving routes (10-20 m/s)
- Complex navigation patterns
- Geofencing triggers
- Location-based feature testing

## License

MIT License

Copyright (c) 2025 Aaron Coppock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 