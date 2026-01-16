import { useState } from 'react'
import DyscalculiaModule from './modules/dyscalculia/dyscalculia'
import './App.css'

function App() {
  const [activeModule, setActiveModule] = useState('dyscalculia')

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Learning Screening Tools</h1>
        <nav className="app-nav">
          <button 
            className={activeModule === 'dyscalculia' ? 'active' : ''}
            onClick={() => setActiveModule('dyscalculia')}
          >
            Dyscalculia
          </button>
          <button 
            className={activeModule === 'dyslexia' ? 'active' : ''}
            onClick={() => setActiveModule('dyslexia')}
          >
            Dyslexia
          </button>
          <button 
            className={activeModule === 'dysgraphia' ? 'active' : ''}
            onClick={() => setActiveModule('dysgraphia')}
          >
            Dysgraphia
          </button>
          <button 
            className={activeModule === 'adhd' ? 'active' : ''}
            onClick={() => setActiveModule('adhd')}
          >
            ADHD
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeModule === 'dyscalculia' && (
          <div className="module-wrapper">
            <DyscalculiaModule />
          </div>
        )}
        {activeModule === 'dyslexia' && (
          <div className="module-wrapper coming-soon">
            <h2>Dyslexia Screening</h2>
            <p>Coming soon</p>
          </div>
        )}
        {activeModule === 'dysgraphia' && (
          <div className="module-wrapper coming-soon">
            <h2>Dysgraphia Screening</h2>
            <p>Coming soon</p>
          </div>
        )}
        {activeModule === 'adhd' && (
          <div className="module-wrapper coming-soon">
            <h2>ADHD Screening</h2>
            <p>Coming soon</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
