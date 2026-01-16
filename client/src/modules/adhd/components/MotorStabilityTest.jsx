import { useState, useEffect, useCallback, useRef } from 'react';

const MotorStabilityTest = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isStarted, setIsStarted] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  const testDataRef = useRef({
    tapTimestamps: [],
    interTapIntervals: [],
  });
  const completedRef = useRef(false);

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space' && isStarted) {
      e.preventDefault();
      const timestamp = Date.now();
      
      testDataRef.current.tapTimestamps.push(timestamp);
      setTapCount(testDataRef.current.tapTimestamps.length);
      
      // Calculate inter-tap interval
      if (testDataRef.current.tapTimestamps.length > 1) {
        const lastTwo = testDataRef.current.tapTimestamps.slice(-2);
        const interval = lastTwo[1] - lastTwo[0];
        testDataRef.current.interTapIntervals.push(interval);
      }
    }
  }, [isStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, onComplete]);

  useEffect(() => {
    if (!isStarted || timeLeft > 0) return;
    if (completedRef.current) return;

    completedRef.current = true;
    onComplete({
      tapTimestamps: testDataRef.current.tapTimestamps,
      interTapIntervals: testDataRef.current.interTapIntervals,
      totalTaps: testDataRef.current.tapTimestamps.length,
    });
  }, [isStarted, timeLeft, onComplete]);

  const startTest = () => {
    completedRef.current = false;
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
        <div className="bg-mantle rounded-3xl p-8 max-w-2xl shadow-material-lg border border-surface0">
          <h2 className="text-3xl font-bold text-mauve mb-6">Phase 3: The Motor Stability Test</h2>
          <div className="text-text space-y-4 mb-8">
            <p className="text-lg">
              This test measures your <span className="text-peach font-semibold">motor control</span> and 
              <span className="text-peach font-semibold"> rhythm stability</span>.
            </p>
            <div className="bg-surface0 rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-lavender">Instructions:</h3>
              <ul className="list-disc list-inside space-y-2 text-subtext1">
                <li>Tap the <kbd className="px-3 py-1 bg-mauve text-base rounded-lg font-mono">SPACE</kbd> bar repeatedly</li>
                <li>Maintain a <span className="text-peach font-bold">steady, consistent rhythm</span></li>
                <li>Not too fast, not too slow</li>
                <li>Try to keep the same tempo throughout</li>
              </ul>
            </div>
            <p className="text-subtext0 text-sm">Duration: 15 seconds</p>
          </div>
          <button
            onClick={startTest}
            className="w-full bg-mauve hover:bg-[#d4b4ff] text-base font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
          >
            Start Tapping Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
      <div className="mb-8">
        <div className="bg-surface0 rounded-full px-6 py-3 border border-surface1">
          <span className="text-peach font-mono text-xl font-bold">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="bg-mantle rounded-3xl w-full max-w-md p-16 flex flex-col items-center justify-center shadow-material-lg border border-surface0">
        <div className="mb-8">
          <svg 
            className="w-32 h-32 text-mauve opacity-50" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <p className="text-2xl font-bold text-text mb-2">Tap the Spacebar</p>
        <p className="text-subtext1 mb-6">Keep a steady rhythm</p>
        
        <div className="bg-surface0 rounded-2xl px-8 py-4 border border-surface1">
          <div className="text-center">
            <span className="text-5xl font-bold text-mauve">{tapCount}</span>
            <p className="text-subtext1 text-sm mt-2">taps</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex gap-2 justify-center">
        {testDataRef.current.interTapIntervals.slice(-10).map((interval, idx) => (
          <div 
            key={idx} 
            className="w-2 bg-peach rounded-full transition-all"
            style={{ 
              height: `${Math.min(interval / 10, 40)}px`,
              opacity: 0.5 + (idx / 10) * 0.5 
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MotorStabilityTest;
