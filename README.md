# Timer App

## Overview
A React-based timer application that allows users to:
- Start multiple timers simultaneously
- Tag and categorize timers
- Save timer intervals
- Track historical timer data
- Receive smart notifications for long-running tasks

## Features
- Multiple active timers
- Custom timer tags
- Interval tracking and saving
- Persistent timer state using localStorage
- Smart notifications based on historical task duration
- Exponential backoff for task reminder notifications

## Technologies
- React
- TypeScript
- localStorage for state persistence

## Getting Started

### Prerequisites
- Node.js
- npm (or yarn/pnpm)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
```bash
npm start
```
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode.

### `npm run build`
Builds the app for production.

### `npm test`
Launches the test runner in interactive watch mode.

## Notification System
The app includes a smart notification system that:
- Tracks timer duration for each tag
- Sends reminders for unusually long tasks
- Uses exponential backoff to prevent notification fatigue
- Ensures at least 1-hour gap between notifications

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[Add your license information here]
