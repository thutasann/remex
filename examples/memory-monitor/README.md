# Remex Example: Memory and Performance Monitoring

This example demonstrates how to use Remex to monitor memory usage and component render performance in a React application.

## Features Demonstrated

- Memory usage monitoring with `useMemoryMonitor`
- Memory leak simulation
- Component render tracking with `useRenderCounter` and `RenderProfiler`
- Integrating Remex with a React application

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Key Components

1. **MemoryDashboard**: Displays real-time memory usage metrics
2. **LeakyComponent**: Simulates a memory leak for demonstration
3. **RenderCounter**: Shows how to track component re-renders

## How to Use

1. Open the application in your browser
2. Click "Mount Leaky Component" to see memory usage increase
3. Watch the memory dashboard to see changes in real-time
4. Observe the render counters to see how often components re-render

## Notes

- Memory metrics are only available in Chromium-based browsers
- The memory leak is simulated for demonstration purposes
- You can extend this example with your own components to test their memory usage
