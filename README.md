# 🚀 Remex

<div align="center">
  <p><strong>Advanced Memory and Performance Analysis for React Applications</strong></p>
  <p>
    <a href="https://www.npmjs.com/package/remexjs"><img src="https://img.shields.io/npm/v/remexjs.svg?style=flat-square" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/remexjs"><img src="https://img.shields.io/npm/dm/remexjs.svg?style=flat-square" alt="npm downloads" /></a>
    <a href="https://github.com/thutasann/remex/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/remexjs.svg?style=flat-square" alt="license" /></a>
  </p>
</div>

## 📊 Why Remex?

Struggling with memory leaks, slow renders, or performance bottlenecks in your React app? Remex provides powerful tools to:

- **Track Memory Usage**: Monitor heap size and identify memory leaks in real-time
- **Analyze Component Performance**: See which components are re-rendering unnecessarily
- **Optimize User Experience**: Reduce jank and improve application responsiveness
- **Component-Level Memory Analysis**: Unique feature to track memory usage per component

## ✨ Features

- 🧠 **Memory Tracking**: Monitor JS heap usage in real-time
- ⚡ **Render Profiling**: Track component render counts and duration
- 📈 **Performance Metrics**: Get detailed performance data
- 🪄 **Easy Integration**: Simple hooks and components for quick setup
- 📱 **React-Focused**: Built specifically for React applications
- 🔧 **TypeScript Support**: 100% type-safe API
- 🛠️ **Extensible**: Designed with an API-first approach
- 💻 **DevTools Extension** (Coming Soon): Visual interface for easier debugging
- 🔍 **Component-Specific Memory**: Track memory usage at the component level

## 🔧 Installation

```bash
# Using npm
npm install remexjs@latest

# Using yarn
yarn add remexjs@latest

# Using pnpm
pnpm add remexjs@latest
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

### Hooks

- `useMemoryMonitor`: Get real-time memory metrics for the entire application
- `useRenderCounter`: Count and analyze component renders
- `useComponentMetrics`: Get detailed component performance metrics
- `useComponentMemory`: Track memory metrics specific to a component
- `useComponentMemoryUsage`: Lower-level hook for accessing memory data from a `MemoryProfiler`

## 💡 Examples

### Tracking Global Memory Usage

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

### Tracking Component-Specific Memory

```jsx
// Example usage in a NavBar component
import React from 'react'
import { MemoryProfiler, useComponentMemory } from 'remexjs'

function NavBar() {
  // Get component-specific memory metrics
  const memoryMetrics = useComponentMemory('NavBar')

  return (
    <MemoryProfiler id='navbar'>
      <nav className='navbar'>
        <h1>My App</h1>
        <div className='memory-info'>
          <p>NavBar Memory: {(memoryMetrics.shallowSize / 1024).toFixed(2)} KB</p>
        </div>
        {/* Rest of navbar */}
      </nav>
    </MemoryProfiler>
  )
}

function SideBar() {
  // Get component-specific memory metrics
  const memoryMetrics = useComponentMemory('SideBar')

  return (
    <MemoryProfiler id='sidebar'>
      <aside className='sidebar'>
        <h2>Menu</h2>
        <div className='memory-info'>
          <p>SideBar Memory: {(memoryMetrics.shallowSize / 1024).toFixed(2)} KB</p>
        </div>
        {/* Rest of sidebar */}
      </aside>
    </MemoryProfiler>
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

### Comparing Two Components

```jsx
function ComponentComparison() {
  return (
    <div className='comparison'>
      <div className='component-wrapper'>
        <h3>Inefficient Component</h3>
        <MemoryProfiler id='inefficient'>
          <InefficiencyComponent />
          <MemoryReadout />
        </MemoryProfiler>
      </div>

      <div className='component-wrapper'>
        <h3>Optimized Component</h3>
        <MemoryProfiler id='optimized'>
          <OptimizedComponent />
          <MemoryReadout />
        </MemoryProfiler>
      </div>
    </div>
  )
}

// Reusable component to display memory metrics
function MemoryReadout() {
  const memoryMetrics = useComponentMemory()

  return (
    <div className='memory-readout'>
      <p>Memory: {(memoryMetrics.shallowSize / 1024).toFixed(2)} KB</p>
    </div>
  )
}
```

## 🔄 How It Works

Remex uses a combination of:

1. **Performance API**: For high-resolution timing
2. **Memory API**: For heap size monitoring
3. **React Profiler**: For component render tracking
4. **Custom Memory Tracking**: For component-level memory analysis
5. **Heuristic Estimation**: For approximating component-specific memory usage

By integrating directly with React's lifecycle, Remex provides insights that generic profilers can't match.

## 🔬 Component-Specific Memory Tracking

Remex implements an innovative approach to track memory usage at the component level:

- **Before/After Measurement**: Takes memory snapshots before and after component mounting
- **Object Tracking**: Monitors objects created by specific components
- **Size Estimation**: Uses heuristics to estimate component memory footprint
- **History Tracking**: Records memory usage over time for trend analysis

This feature provides unprecedented visibility into which components are consuming memory in your application.

## 🚀 Roadmap

- DevTools Extension with visual interface
- React Native support
- Memory leak detection algorithms
- Automated performance suggestions
- Component tree visualization
- Custom event tracking
- Enhanced component-specific memory tracking accuracy

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📜 License

MIT © [thutasann](https://github.com/thutasann)
