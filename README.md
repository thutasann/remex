# 🚀 Remex

<div align="center">
  <p><strong>Advanced Memory and Performance Analysis for React Applications</strong></p>
  <p>
    <a href="https://www.npmjs.com/package/remex"><img src="https://img.shields.io/npm/v/remex.svg?style=flat-square" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/remex"><img src="https://img.shields.io/npm/dm/remex.svg?style=flat-square" alt="npm downloads" /></a>
    <a href="https://github.com/thutasann/remex/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/remex.svg?style=flat-square" alt="license" /></a>
  </p>
</div>

## 📊 Why Remex?

Struggling with memory leaks, slow renders, or performance bottlenecks in your React app? Remex provides powerful tools to:

- **Track Memory Usage**: Monitor heap size and identify memory leaks in real-time
- **Analyze Component Performance**: See which components are re-rendering unnecessarily
- **Generate Heap Snapshots**: Get detailed insights into memory allocation
- **Optimize User Experience**: Reduce jank and improve application responsiveness

## ✨ Features

- 🧠 **Memory Tracking**: Monitor JS heap usage in real-time
- ⚡ **Render Profiling**: Track component render counts and duration
- 📈 **Performance Metrics**: Get detailed performance data
- 🪄 **Easy Integration**: Simple hooks and components for quick setup
- 📱 **React-Focused**: Built specifically for React applications
- 🔧 **TypeScript Support**: 100% type-safe API
- 🛠️ **Extensible**: Designed with an API-first approach
- 💻 **DevTools Extension** (Coming Soon): Visual interface for easier debugging

## 🔧 Installation

```bash
# Using npm
npm install remexjs

# Using yarn
yarn add remexjs

# Using pnpm
pnpm add remexjs
```

## 🚦 Quick Start

```jsx
import React from 'react'
import { RemexProvider, MemoryProfiler, useMemoryMonitor } from 'remexjs'

// Wrap your app with the RemexProvider
function App() {
  return (
    <RemexProvider>
      <YourApp />
    </RemexProvider>
  )
}

// Monitor memory in any component
function Dashboard() {
  const { metrics, history } = useMemoryMonitor()

  return (
    <div>
      <h1>Memory Usage</h1>
      <p>Current: {(metrics?.usedJSHeapSize / 1048576).toFixed(2)} MB</p>
      <p>Total: {(metrics?.totalJSHeapSize / 1048576).toFixed(2)} MB</p>
    </div>
  )
}

// Track renders on specific components
function ExpensiveComponent() {
  return <MemoryProfiler id='expensive-component'>{/* Your component content */}</MemoryProfiler>
}
```

## 📚 Core APIs

### Providers

- `RemexProvider`: The main context provider for Remex

### Profilers

- `MemoryProfiler`: Track memory usage of specific components
- `RenderProfiler`: Monitor render times and frequencies
- `HeapSnapshotAnalyzer`: Generate and analyze heap snapshots

### Hooks

- `useMemoryMonitor`: Get real-time memory metrics
- `useRenderCounter`: Count and analyze component renders
- `useComponentMetrics`: Get detailed component performance metrics

## 💡 Examples

### Tracking Memory Usage

```jsx
function MemoryDashboard() {
  const { metrics, history, isMonitoring, startMonitoring, stopMonitoring } = useMemoryMonitor()

  if (!metrics) return <div>Loading metrics...</div>

  return (
    <div>
      <h2>Memory Dashboard</h2>
      <button onClick={isMonitoring ? stopMonitoring : startMonitoring}>
        {isMonitoring ? 'Pause Monitoring' : 'Start Monitoring'}
      </button>

      <div>
        <h3>Current Usage</h3>
        <ul>
          <li>Used: {(metrics.usedJSHeapSize / 1048576).toFixed(2)} MB</li>
          <li>Total: {(metrics.totalJSHeapSize / 1048576).toFixed(2)} MB</li>
          <li>Limit: {(metrics.jsHeapSizeLimit / 1048576).toFixed(2)} MB</li>
        </ul>
      </div>

      {/* Render a chart with history data */}
    </div>
  )
}
```

### Tracking Component Renders

```jsx
function ExpensiveList({ items }) {
  // Track render count automatically
  const renderCount = useRenderCounter({
    componentName: 'ExpensiveList',
    logToConsole: true,
  })

  return (
    <div>
      <p>Rendered {renderCount} times</p>
      <ul>
        {items.map((item) => (
          <RenderProfiler key={item.id} id={`item-${item.id}`}>
            <ListItem item={item} />
          </RenderProfiler>
        ))}
      </ul>
    </div>
  )
}
```

## 🔄 How It Works

Remex uses a combination of:

1. **Performance API**: For high-resolution timing
2. **Memory API**: For heap size monitoring
3. **React Profiler**: For component render tracking
4. **Custom Metrics**: For accurate performance analysis

By integrating directly with React's lifecycle, Remex provides insights that generic profilers can't match.

## 🚀 Roadmap

- DevTools Extension with visual interface
- React Native support
- Memory leak detection algorithms
- Automated performance suggestions
- Component tree visualization
- Custom event tracking

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📜 License

MIT © [thutasann](https://github.com/thutasann)
