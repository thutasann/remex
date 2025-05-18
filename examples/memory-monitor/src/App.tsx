import { RemexProvider } from 'remexjs'
import './App.css'
import { CompareComponents, EntireApplicationCompare } from './features'

function App() {
  return (
    <RemexProvider>
      <div className='app-container'>
        <EntireApplicationCompare />
        <CompareComponents />
      </div>
    </RemexProvider>
  )
}

export default App
