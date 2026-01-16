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
      <div className="min-h-screen bg-base flex items-center justify-center px-8 py-12">
        <div className="bg-mantle rounded-3xl p-12 max-w-4xl shadow-material-lg border border-surface0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-mauve mb-4">Neuro-Cognitive Suite</h1>
            <p className="text-xl text-peach font-semibold">ADHD Screening Assessment</p>
          </div>
          
          <div className="text-text space-y-6 mb-10">
            <p className="text-lg leading-relaxed">
              Welcome to the comprehensive ADHD screening tool. This assessment evaluates three key 
              cognitive domains affected by attention disorders through scientifically-validated tasks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface0 rounded-2xl p-6 border border-surface1">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-semibold text-lavender mb-2">Focus Stability</h3>
                <p className="text-subtext1 text-sm">Sustained attention and impulse control assessment</p>
              </div>
              
              <div className="bg-surface0 rounded-2xl p-6 border border-surface1">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="text-xl font-semibold text-lavender mb-2">Working Memory</h3>
                <p className="text-subtext1 text-sm">Cognitive flexibility and memory capacity test</p>
              </div>
              
              <div className="bg-surface0 rounded-2xl p-6 border border-surface1">
                <div className="text-3xl mb-3">✋</div>
                <h3 className="text-xl font-semibold text-lavender mb-2">Motor Control</h3>
                <p className="text-subtext1 text-sm">Rhythm stability and motor coordination analysis</p>
              </div>
            </div>

            <div className="bg-surface0 rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-peach">Before You Begin:</h3>
              <ul className="list-disc list-inside space-y-2 text-subtext1">
                <li>Find a quiet environment free from distractions</li>
                <li>Ensure you're well-rested and focused</li>
                <li>Complete all three phases in one sitting (~3-4 minutes total)</li>
                <li>Use a physical keyboard (not mobile)</li>
              </ul>
            </div>

            <div className="bg-surface0 border border-blue rounded-2xl p-4">
              <p className="text-blue text-sm">
                <strong>ℹ️ Note:</strong> This assessment uses AI-powered analysis to provide insights 
                into your cognitive profile. Results are educational and not a medical diagnosis.
              </p>
            </div>
          </div>

          <button
            onClick={startAssessment}
            className="w-full bg-mauve hover:bg-[#d4b4ff] text-base font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  if (currentPhase === 4) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center px-8">
        <div className="bg-mantle rounded-3xl p-12 max-w-2xl text-center shadow-material-lg border border-surface0">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-mauve border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-3xl font-bold text-mauve mb-4">Analyzing Your Results</h2>
            <p className="text-text text-lg">
              Processing your cognitive data with AI-powered insights...
            </p>
          </div>
          <div className="flex flex-col gap-3 text-left bg-surface0 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-green">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span>Calculating statistical metrics</span>
            </div>
            <div className="flex items-center gap-3 text-peach">
              <svg className="w-6 h-6 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
              <span>Generating AI analysis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      {/* Progress Bar */}
      <div className="bg-mantle border-b border-surface0">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-text">ADHD Assessment</h2>
            <span className="text-subtext1 text-sm">Phase {currentPhase} of 3</span>
          </div>
          <div className="w-full bg-surface0 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-mauve to-peach h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentPhase / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Test Phases */}
      <div className="max-w-6xl mx-auto">
        {currentPhase === 1 && <FocusTest onComplete={handleFocusComplete} />}
        {currentPhase === 2 && <WorkingMemoryTest onComplete={handleMemoryComplete} />}
        {currentPhase === 3 && <MotorStabilityTest onComplete={handleTappingComplete} />}
        {currentPhase === 5 && <ResultsDisplay results={results} aiAnalysis={aiAnalysis} />}
      </div>
    </div>
  );
};

export default AdhdAssessment;
