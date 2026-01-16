import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import viteLogo from '/vite.svg'
import Dysgraphia from './modules/dysgraphia/dysgraphia.jsx'
import Dyslexia from './modules/dyslexia/dyslexia.jsx'
import DyscalculiaModule from './modules/dyscalculia/dyscalculia'
import Adhd from './modules/adhd/adhd.jsx'

function App() {
  const [serverStatus, setServerStatus] = useState("...")

  useEffect(() => {
    let isMounted = true

    fetch("/api/health")
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Health check failed")))
      .then((json) => {
        if (isMounted) {
          setServerStatus(json.status)
        }
      })
      .catch(() => {
        if (isMounted) {
          setServerStatus("offline")
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-transparent font-sans">
        <nav className="glass sticky top-0 z-50 border-b border-white/10">
          <div className="mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-mauve to-blue rounded-full opacity-60 group-hover:opacity-100 blur transition duration-200"></div>
                  <img src={viteLogo} className="relative h-9 w-9" alt="Vite logo" />
                </div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve via-pink to-blue tracking-tight drop-shadow-sm">
                  SCOUT
                </h1>
              </div>
              <div className="glass-card px-4 py-1.5 rounded-full text-xs font-medium text-subtext1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${serverStatus === 'healthy' ? 'bg-green shadow-[0_0_8px_rgba(166,227,161,0.6)]' : 'bg-red'}`}></span>
                Server: {serverStatus}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dysgraphia" element={<Dysgraphia />} />
          <Route path="/dyslexia" element={<Dyslexia />} />
          <Route path="/dyscalculia" element={<DyscalculiaModule />} />
          <Route path="/adhd" element={<Adhd />} />
        </Routes>
      </div>
    </Router>
  )

  function Home() {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mauve via-pink to-blue mb-6 drop-shadow-[0_4px_10px_rgba(203,166,247,0.3)] tracking-tighter">
            SCOUT
          </h1>
          <p className="text-2xl font-bold text-subtext0 max-w-2xl mx-auto tracking-wide">
            (Student Cognitive Observation & Understanding Tool)
          </p>
          <div className="mt-8 glass inline-block px-6 py-2 rounded-full border border-white/5">
            <p className="text-lg text-subtext1">
              Select a module below to begin analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <Link
            to="/dysgraphia"
            className="bg-surface0 rounded-lg shadow-material p-6 hover:shadow-material-lg transition-shadow border border-surface1 w-80"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Dysgraphia Analysis</h3>
              <p className="text-subtext0 text-sm">Analyze handwriting and writing samples for dysgraphia indicators</p>
              <div className="mt-4 text-blue font-medium text-sm hover:text-sky">
                Get Started →
              </div>
            </div>
          </Link>

          <Link
            to="/dyslexia"
            className="bg-surface0 rounded-lg shadow-material p-6 hover:shadow-material-lg transition-shadow border border-surface1 w-80"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-mauve/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Dyslexia Analysis</h3>
              <p className="text-subtext0 text-sm">
                Upload handwriting samples to assess dyslexia-associated visual patterns
              </p>
              <div className="mt-4 text-mauve font-medium text-sm hover:text-lavender">
                Get Started →
              </div>
            </div>
          </Link>

          <Link
            to="/dyscalculia"
            className="bg-surface0 rounded-lg shadow-material p-6 hover:shadow-material-lg transition-shadow border border-surface1 w-80"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Dyscalculia Analysis</h3>
              <p className="text-subtext0 text-sm">Interactive tasks to assess numerical processing and mathematical cognition</p>
              <div className="mt-4 text-green font-medium text-sm hover:text-teal">
                Get Started →
              </div>
            </div>
          </Link>

          <Link
            to="/adhd"
            className="bg-surface0 rounded-lg shadow-material p-6 hover:shadow-material-lg transition-shadow border border-surface1 w-80"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-mauve/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">ADHD Assessment</h3>
              <p className="text-subtext0 text-sm">Neuro-cognitive screening with AI-powered analysis</p>
              <div className="mt-4 text-mauve font-medium text-sm hover:text-lavender">
                Get Started →
              </div>
            </div>
          </Link>
        </div>
      </div>
    )
  }
}

export default App
