import { useEffect, useState } from 'react'

// This component simulates a memory leak by storing large arrays
const LeakyComponent = () => {
  const [leaks, setLeaks] = useState<any[]>([])

  useEffect(() => {
    // Create a memory leak by continuously adding data to an array
    const interval = setInterval(() => {
      // Create a large array (about 1MB)
      const largeArray = new Array(250000).fill('A memory leak simulation')
      setLeaks((prev) => [...prev, largeArray])
    }, 2000)

    return () => {
      clearInterval(interval)
      // Even though we clean up the interval, the state remains in memory until component is unmounted
    }
  }, [])

  return (
    <div className='leaky-component'>
      <h3>Leaky Component</h3>
      <p>This component is creating memory leaks.</p>
      <p>Large arrays created: {leaks.length}</p>
      <p>Approximate memory usage: {(leaks.length * 1).toFixed(2)} MB</p>
    </div>
  )
}

export default LeakyComponent
