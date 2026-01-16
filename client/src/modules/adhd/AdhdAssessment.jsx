import { useState } from 'react';
import FocusTest from './components/FocusTest';
import WorkingMemoryTest from './components/WorkingMemoryTest';
import MotorStabilityTest from './components/MotorStabilityTest';
import ResultsDisplay from './components/ResultsDisplay';

const AdhdAssessment = () => {
  const [currentPhase, setCurrentPhase] = useState(0); // 0: intro, 1-3: tests, 4: loading, 5: results
  const [testData, setTestData] = useState({
    sart: null,
    workingMemory: null,
    tapping: null,
  });
  const [results, setResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleFocusComplete = (data) => {
    setTestData(prev => ({ ...prev, sart: data }));
    setCurrentPhase(2);
  };

  const handleMemoryComplete = (data) => {
    setTestData(prev => ({ ...prev, workingMemory: data }));
    setCurrentPhase(3);
  };

  const handleTappingComplete = async (data) => {
    const completeData = {
      ...testData,
      tapping: data,
    };
    setTestData(completeData);
    setCurrentPhase(4);
    
    // Submit to backend
    await submitAssessment(completeData);
  };

  const submitAssessment = async (data) => {
    try {
      const response = await fetch('/api/adhd/finalize-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze results');
      }

      const result = await response.json();
      setResults(result.metrics);
      setAiAnalysis(result.analysis);
      setCurrentPhase(5);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      // Show error but still display basic results
      setResults({
        sart: {
          meanReactionTime: data.sart.reactionTimes.length > 0 
            ? data.sart.reactionTimes.reduce((a, b) => a + b, 0) / data.sart.reactionTimes.length 
            : 0,
          commissionErrors: data.sart.commissionErrors,
          accuracy: data.sart.totalSevens > 0 
            ? (data.sart.correctHits / data.sart.totalSevens) * 100 
            : 0,
        },
        workingMemory: {
          accuracy: data.workingMemory.accuracy,
          correctResponses: data.workingMemory.correctResponses,
          totalTargets: data.workingMemory.totalTargets,
        },
        tapping: {
          totalTaps: data.tapping.totalTaps,
          variance: 0,
          meanInterval: 0,
        },
      });
      setAiAnalysis('<p class="text-red">Unable to connect to analysis service. Please check if the backend is running.</p>');
      setCurrentPhase(5);
    } finally {
    }
  };

  const startAssessment = () => {
    setCurrentPhase(1);
  };

  if (currentPhase === 0) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-8 py-12">
        <div className="glass-panel rounded-3xl p-12 max-w-4xl">
          <div className="text-center mb-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-mauve opacity-20 blur-3xl rounded-full pointer-events-none"></div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mauve via-pink to-blue mb-6 tracking-tight drop-shadow-[0_2px_10px_rgba(236,72,153,0.3)]">Neuro-Cognitive Suite</h1>
            <div className="inline-block glass px-6 py-2 rounded-full border border-peach/30">
              <p className="text-xl text-peach font-bold tracking-wide uppercase">ADHD Screening Assessment</p>
            </div>
          </div>
          
          <div className="text-text space-y-8 mb-12 relative z-10">
            <p className="text-xl leading-relaxed text-center max-w-2xl mx-auto text-subtext0">
              Welcome to the comprehensive ADHD screening tool. This assessment evaluates three key 
              cognitive domains affected by attention disorders through scientifically-validated tasks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card hover:bg-surface0/30 rounded-2xl p-6 transition-all duration-300 group">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h3 className="text-xl font-bold text-lavender mb-2">Focus Stability</h3>
                <p className="text-subtext1 text-sm font-medium">Sustained attention and impulse control assessment</p>
              </div>
              
              <div className="glass-card hover:bg-surface0/30 rounded-2xl p-6 transition-all duration-300 group">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🧠</div>
                <h3 className="text-xl font-bold text-lavender mb-2">Working Memory</h3>
                <p className="text-subtext1 text-sm font-medium">Cognitive flexibility and memory capacity test</p>
              </div>
              
              <div className="glass-card hover:bg-surface0/30 rounded-2xl p-6 transition-all duration-300 group">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">✋</div>
                <h3 className="text-xl font-bold text-lavender mb-2">Motor Control</h3>
                <p className="text-subtext1 text-sm font-medium">Rhythm stability and motor coordination analysis</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 border-l-4 border-l-peach">
              <h3 className="text-xl font-bold text-peach mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Before You Begin:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-subtext1 font-medium">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-peach"></span>Find a quiet environment free from distractions</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-peach"></span>Ensure you're well-rested and focused</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-peach"></span>Complete all three phases in one sitting (~3-4 mins)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-peach"></span>Use a physical keyboard (not mobile)</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-4 flex items-start gap-4">
               <div className="p-2 bg-blue/10 rounded-lg text-blue">ℹ️</div>
              <p className="text-blue/90 text-sm font-medium pt-1">
                <strong>Note:</strong> This assessment uses AI-powered analysis to provide insights 
                into your cognitive profile. Results are educational and not a medical diagnosis.
              </p>
            </div>
          </div>

          <button
            onClick={startAssessment}
            className="w-full bg-gradient-to-r from-mauve to-blue hover:from-mauve/90 hover:to-blue/90 text-base font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(203,166,247,0.3)] hover:shadow-[0_0_30px_rgba(203,166,247,0.5)] transform hover:-translate-y-1 text-crust tracking-wide text-lg"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  if (currentPhase === 4) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-8">
        <div className="glass-panel rounded-3xl p-16 max-w-2xl text-center">
          <div className="mb-10 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-mauve opacity-20 blur-3xl rounded-full"></div>
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border-4 border-surface0 relative">
                <div className="absolute inset-0 rounded-full border-4 border-mauve border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-blue border-b-transparent animate-spin-slow opacity-70"></div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve to-blue mb-4">Analyzing Your Results</h2>
            <p className="text-subtext0 text-xl font-medium">
              Processing your cognitive data with AI-powered insights...
            </p>
          </div>
          <div className="flex flex-col gap-4 text-left glass rounded-2xl p-8">
            <div className="flex items-center gap-4 text-green font-medium p-2 rounded-lg transition-colors bg-green/5">
              <div className="p-2 bg-green/10 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <span className="text-lg">Calculating statistical metrics</span>
            </div>
            <div className="flex items-center gap-4 text-peach font-medium p-2 rounded-lg bg-peach/5 border border-peach/20">
               <div className="p-2 bg-peach/10 rounded-full">
                <svg className="w-6 h-6 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
              </div>
              <span className="text-lg">Generating AI analysis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayPhase = Math.min(Math.max(currentPhase, 1), 3);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Progress Bar */}
      <div className="glass border-b border-black/5 sticky top-20 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-subtext0">ADHD Assessment</h2>
            <div className="glass px-4 py-1 rounded-full border border-black/5">
               <span className="text-subtext0 font-medium tracking-wide text-sm">PHASE <span className="text-mauve font-bold">{displayPhase}</span> / 3</span>
            </div>
          </div>
          <div className="w-full bg-surface0/30 rounded-full h-2 backdrop-blur-sm overflow-hidden">
            <div 
              className="bg-gradient-to-r from-mauve via-pink to-peach h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(203,166,247,0.5)] relative"
              style={{ width: `${(displayPhase / 3) * 100}%` }}
            >
               <div className="absolute inset-0 bg-white/30 w-full h-full animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Phases */}
      <div className="max-w-5xl mx-auto mt-8 p-4">
        {currentPhase === 1 && <FocusTest onComplete={handleFocusComplete} />}
        {currentPhase === 2 && <WorkingMemoryTest onComplete={handleMemoryComplete} />}
        {currentPhase === 3 && <MotorStabilityTest onComplete={handleTappingComplete} />}
        {currentPhase === 5 && <ResultsDisplay results={results} aiAnalysis={aiAnalysis} />}
      </div>
    </div>
  );
};

export default AdhdAssessment;
