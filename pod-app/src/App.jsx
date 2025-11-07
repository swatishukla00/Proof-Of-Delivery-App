import { useState } from 'react'
import './App.css'
import LogisticsPOD from './components/LogisticsPOD'

function App() {
  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <h1>Logistics Proof of Delivery</h1>
        </header>
        <main>
          <LogisticsPOD />
        </main>
      </div>
    </>
  )
}

export default App