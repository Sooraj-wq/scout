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
        <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve via-peach to-yellow mb-6">Phase 3: The Motor Stability Test</h2>
          <div className="text-text space-y-6 mb-8">
            <p className="text-lg">
              This test measures your <span className="text-peach font-bold drop-shadow-sm">motor control</span> and 
              <span className="text-peach font-bold drop-shadow-sm"> rhythm stability</span>.
            </p>
            <div className="glass rounded-2xl p-6 space-y-4 shadow-inner border border-white/5">
              <h3 className="text-xl font-bold text-lavender flex items-center gap-2">
                <span>📋</span> Instructions:
              </h3>
              <ul className="space-y-3 text-subtext1">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mauve shrink-0"></span>
                  <span>Tap the <kbd className="px-2 py-0.5 glass-card rounded border border-white/20 font-mono text-text">SPACE</kbd> bar repeatedly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-peach shrink-0"></span>
                  <span>Maintain a <span className="text-peach font-bold">steady, consistent rhythm</span></span>
                </li>
                <li className="flex items-start gap-3">
                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mauve shrink-0"></span>
                   <span>Not too fast, not too slow — try to be metronomic</span>
                </li>
              </ul>
            </div>
            <p className="text-subtext0 text-sm font-medium flex items-center gap-2">
              <span>⏱️</span> Duration: 15 seconds
            </p>
          </div>
          <button
            onClick={startTest}
            className="w-full glass-button text-text text-base font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
        <div className="glass px-6 py-3 rounded-full border border-peach/30 shadow-[0_0_15px_rgba(250,179,135,0.2)]">
          <span className="text-peach font-mono text-2xl font-bold tracking-wider">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="glass-panel rounded-3xl w-full max-w-md p-12 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-mauve/10 to-transparent opacity-50"></div>
        <div className="mb-8 relative z-10 scale-110">
          <svg 
            className="w-32 h-32 text-mauve opacity-80 filter drop-shadow-[0_0_15px_rgba(203,166,247,0.4)]" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve to-peach mb-2 relative z-10">Tap Spacebar</p>
        <p className="text-subtext1 mb-8 relative z-10">Keep a steady rhythm</p>
        
        <div className="glass rounded-2xl px-12 py-6 border border-white/5 shadow-inner relative z-10 transform transition-transform duration-100 hover:scale-105">
          <div className="text-center">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-mauve to-pink drop-shadow-sm">{tapCount}</span>
            <p className="text-subtext0 text-sm mt-3 font-medium uppercase tracking-widest">taps</p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex gap-1 justify-center items-end h-16 w-full max-w-md px-4 glass rounded-xl border border-white/5 py-4">
        {testDataRef.current.interTapIntervals.slice(-20).map((interval, idx) => (
          <div 
            key={idx} 
            className="w-3 bg-gradient-to-t from-peach to-mauve rounded-t-sm transition-all shadow-[0_0_8px_rgba(250,179,135,0.4)]"
            style={{ 
              height: `${Math.min(interval / 15, 60)}%`,
              opacity: 0.3 + (idx / 20) * 0.7 
            }}
          />
        ))}
         {testDataRef.current.interTapIntervals.length === 0 && <span className="text-subtext1 text-sm italic w-full text-center">Rhythm visualizer</span>}
      </div>
    </div>
  );
};

export default MotorStabilityTest;
