import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import viteLogo from '/vite.svg'
import './App.css'
import Dysgraphia from './modules/dysgraphia/dysgraphia.jsx'
import Adhd from './modules/adhd/adhd.jsx'

function App() {
  const [count, setCount] = useState(0)
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
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={viteLogo} className="h-8 w-8" alt="Vite logo" />
                <h1 className="text-xl font-bold text-gray-800">Learning Analysis Platform</h1>
              </div>
              <div className="text-sm text-gray-600">
                Server: {serverStatus}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home count={count} setCount={setCount} />} />
          <Route path="/dysgraphia" element={<Dysgraphia />} />
          <Route path="/adhd" element={<Adhd />} />
        </Routes>
      </div>
    </Router>
  )

  function Home({ count, setCount }) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the Learning Analysis Platform</h2>
          <p className="text-lg text-gray-600 mb-8">Select a module below to begin analysis</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <Link
            to="/dysgraphia"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 w-80"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Dysgraphia Analysis</h3>
              <p className="text-gray-600 text-sm">Analyze handwriting and writing samples for dysgraphia indicators</p>
              <div className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
                Get Started →
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 opacity-60 w-80">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Dyslexia Analysis</h3>
              <p className="text-gray-600 text-sm">Coming soon - Analyze reading patterns and text comprehension</p>
              <div className="mt-4 text-gray-400 font-medium text-sm">
                Coming Soon
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 opacity-60 w-80">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Dyscalculia Analysis</h3>
              <p className="text-gray-600 text-sm">Coming soon - Analyze mathematical thinking and problem-solving</p>
              <div className="mt-4 text-gray-400 font-medium text-sm">
                Coming Soon
              </div>
            </div>
          </div>

          <Link
            to="/adhd"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 w-80"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">ADHD Assessment</h3>
              <p className="text-gray-600 text-sm">Neuro-cognitive screening with AI-powered analysis</p>
              <div className="mt-4 text-purple-600 font-medium text-sm hover:text-purple-700">
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
