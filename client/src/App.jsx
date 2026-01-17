import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import viteLogo from './assets/vite.svg'
import Dysgraphia from './modules/dysgraphia/dysgraphia.jsx'
import Dyslexia from './modules/dyslexia/dyslexia.jsx'
import DyscalculiaModule from './modules/dyscalculia/dyscalculia'
import Adhd from './modules/adhd/adhd.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import Dyspraxia from './modules/dyspraxia/dyspraxia.jsx'
import Quiz from './modules/quiz/Quiz.jsx'
import LanguageToggle from './components/LanguageToggle.jsx'
import { useLanguage } from './context/LanguageContext.jsx'

function App() {
  const [serverStatus, setServerStatus] = useState("...")
  const { t } = useLanguage()

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
        <nav className="glass sticky top-0 z-50 border-b border-black/5">
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
              <div className="flex items-center gap-3">
                <div className="glass-card px-4 py-1.5 rounded-full text-xs font-medium text-subtext1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${serverStatus === 'healthy' ? 'bg-green shadow-[0_0_8px_rgba(166,227,161,0.6)]' : 'bg-red'}`}></span>
                  {t('server')}: {serverStatus}
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        <LanguageToggle />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dysgraphia" element={<Dysgraphia />} />
          <Route path="/dyslexia" element={<Dyslexia />} />
          <Route path="/dyscalculia" element={<DyscalculiaModule />} />
          <Route path="/adhd" element={<Adhd />} />
          <Route path="/dyspraxia" element={<Dyspraxia />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </div>
    </Router>
  )

  function Home() {
    const { t } = useLanguage()
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [drops, setDrops] = useState([]);

    useEffect(() => {
      setDrops(Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: Math.random() * 2 + 2,
        animationDelay: Math.random() * 2,
        opacity: Math.random() * 0.03 + 0.01
      })));
    }, []);

    useEffect(() => {
      const words = ["SCOUT", "സ്കൗട്ട്"];
      const currentWord = words[wordIndex % words.length];
      const typeSpeed = isDeleting ? 100 : 200;

      const timer = setTimeout(() => {
        if (!isDeleting && displayText === currentWord) {
           setTimeout(() => setIsDeleting(true), 2000);
           return;
        }

        if (isDeleting && displayText === '') {
           setIsDeleting(false);
           setWordIndex((prev) => prev + 1);
           return;
        }

        setDisplayText(prev => {
           if (isDeleting) return prev.slice(0, -1);
           return currentWord.slice(0, prev.length + 1);
        });
      }, typeSpeed);

      return () => clearTimeout(timer);
    }, [displayText, isDeleting, wordIndex]);

    return (
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <div className="fixed inset-0 pointer-events-none overflow-hidden h-full w-full">
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="absolute -top-10 w-[1px] h-24 bg-gradient-to-b from-transparent via-mauve/20 to-mauve/40 animate-shower rounded-full"
              style={{
                left: `${drop.left}%`,
                animationDuration: `${drop.animationDuration}s`,
                animationDelay: `${drop.animationDelay}s`,
                opacity: drop.opacity,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="min-h-[9rem] mb-6 flex items-center justify-center"> {/* Use min-height and flex to center vertically */}
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mauve via-pink to-blue drop-shadow-[0_4px_10px_rgba(203,166,247,0.3)] tracking-tighter inline-block py-2 leading-relaxed font-malayalam">
              {displayText}
              <span className="w-2 bg-blue inline-block h-20 align-middle ml-2 animate-pulse rounded-full"></span>
            </h1>
          </div>
          <p className="text-2xl font-bold text-subtext0 max-w-2xl mx-auto tracking-wide mb-4">
            {t('appSubtitle')}
          </p>
          <p className="text-lg text-subtext1 max-w-3xl mx-auto leading-relaxed">
            {t('appDescription')}
          </p>
          <div className="mt-8 glass inline-block px-6 py-2 rounded-full border border-black/5">
            <p className="text-lg text-subtext1">
              {t('selectModule')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up justify-items-center" style={{ animationDelay: '0.2s' }}>
          <Link
            to="/dysgraphia"
            className="glass-card rounded-2xl p-6 w-full max-w-sm hover:scale-105 transition-transform duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 py-1 leading-relaxed font-malayalam">{t('dysgraphiaTitle')}</h3>
              <p className="text-subtext0 text-sm leading-relaxed py-0.5">{t('dysgraphiaDesc')}</p>
              <div className="mt-4 text-blue font-medium text-sm hover:text-sky">
                {t('getStarted')}
              </div>
            </div>
          </Link>

          <Link
            to="/dyslexia"
            className="glass-card rounded-2xl p-6 w-full max-w-sm hover:scale-105 transition-transform duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-mauve/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 py-1 leading-relaxed font-malayalam">{t('dyslexiaTitle')}</h3>
              <p className="text-subtext0 text-sm leading-relaxed py-0.5">{t('dyslexiaDesc')}</p>
              <div className="mt-4 text-mauve font-medium text-sm hover:text-lavender">
                {t('getStarted')}
              </div>
            </div>
          </Link>

          <Link
            to="/dyscalculia"
            className="glass-card rounded-2xl p-6 w-full max-w-sm hover:scale-105 transition-transform duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 py-1 leading-relaxed font-malayalam">{t('dyscalculiaTitle')}</h3>
              <p className="text-subtext0 text-sm leading-relaxed py-0.5">{t('dyscalculiaDesc')}</p>
              <div className="mt-4 text-green font-medium text-sm hover:text-teal">
                {t('getStarted')}
              </div>
            </div>
          </Link>

          <Link
            to="/adhd"
            className="glass-card rounded-2xl p-6 w-full max-w-sm hover:scale-105 transition-transform duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-mauve/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 py-1 leading-relaxed font-malayalam">{t('adhdTitle')}</h3>
              <p className="text-subtext0 text-sm leading-relaxed py-0.5">{t('adhdDesc')}</p>
              <div className="mt-4 text-mauve font-medium text-sm hover:text-lavender">
                {t('getStarted')}
              </div>
            </div>
          </Link>

          <Link
            to="/dyspraxia"
            className="glass-card rounded-2xl p-6 w-full max-w-sm hover:scale-105 transition-transform duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 py-1 leading-relaxed font-malayalam">{t('dyspraxiaTitle')}</h3>
              <p className="text-subtext0 text-sm leading-relaxed py-0.5">{t('dyspraxiaDesc')}</p>
              <div className="mt-4 text-pink font-medium text-sm hover:text-flamingo">
                {t('getStarted')}
              </div>
            </div>
          </Link>



          <Link
            to="/quiz"
            className="glass-card rounded-2xl p-6 w-full max-w-sm hover:scale-105 transition-transform duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2 py-1 leading-relaxed font-malayalam">
                {t('quizTitle')}
              </h3>
              <p className="text-subtext0 text-sm leading-relaxed py-0.5">{t('quizDesc')}</p>
              <div className="mt-4 text-red font-medium text-sm">
                {t('startQuiz')}
              </div>
            </div>
          </Link>
        </div>
        </div>
      </div>
    )
  }
}

export default App
