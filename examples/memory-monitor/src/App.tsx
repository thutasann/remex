import { RemexProvider } from 'remexjs'
import './App.css'
import { CompareComponents } from './features'

function App() {
  return (
    <RemexProvider>
      <div className='app-container'>
        <CompareComponents />
      </div>
    </RemexProvider>
  )
}

export default App
