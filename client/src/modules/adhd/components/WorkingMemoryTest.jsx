import { useState, useEffect, useCallback, useRef } from 'react';

const WorkingMemoryTest = ({ onComplete }) => {
  const [currentLetter, setCurrentLetter] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isStarted, setIsStarted] = useState(false);
  
  const testDataRef = useRef({
    sequence: [],
    correctResponses: 0,
    incorrectResponses: 0,
    totalTargets: 0,
    missedTargets: 0,
    currentStimulus: null,
  });
  const hideTimeoutRef = useRef(null);
  const completedRef = useRef(false);
  const timeLeftRef = useRef(45);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const generateRandomLetter = useCallback(() => {
    return letters[Math.floor(Math.random() * letters.length)];
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space' && isVisible && isStarted) {
      e.preventDefault();

      const stimulus = testDataRef.current.currentStimulus;
      if (!stimulus || stimulus.responded) return;

      if (stimulus.isTarget) {
        testDataRef.current.correctResponses++;
      } else {
        testDataRef.current.incorrectResponses++;
      }

      testDataRef.current.currentStimulus.responded = true;
    }
  }, [isVisible, isStarted]);

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
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!isStarted || timeLeft > 0) return;
    if (completedRef.current) return;

    completedRef.current = true;

    const accuracy = testDataRef.current.totalTargets > 0 
      ? (testDataRef.current.correctResponses / testDataRef.current.totalTargets) * 100 
      : 0;

    onComplete({
      sequence: testDataRef.current.sequence,
      correctResponses: testDataRef.current.correctResponses,
      incorrectResponses: testDataRef.current.incorrectResponses,
      totalTargets: testDataRef.current.totalTargets,
      accuracy: accuracy,
    });
  }, [isStarted, timeLeft, onComplete]);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;

    const stimulusInterval = setInterval(() => {
      if (timeLeftRef.current <= 0) {
        return;
      }

      const sequence = testDataRef.current.sequence;
      let letter = generateRandomLetter();

      if (sequence.length >= 2 && Math.random() < 0.3) {
        letter = sequence[sequence.length - 2];
      }

      const isTarget = sequence.length >= 2 && letter === sequence[sequence.length - 2];
      if (isTarget) {
        testDataRef.current.totalTargets++;
      }

      testDataRef.current.sequence.push(letter);
      testDataRef.current.currentStimulus = { isTarget, responded: false };

      setCurrentLetter(letter);
      setIsVisible(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        const stimulus = testDataRef.current.currentStimulus;
        if (stimulus && stimulus.isTarget && !stimulus.responded) {
          testDataRef.current.missedTargets++;
        }
      }, 1000);
    }, 1500);

    return () => {
      clearInterval(stimulusInterval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isStarted, generateRandomLetter]);

  const startTest = () => {
    completedRef.current = false;
    timeLeftRef.current = 45;
    setTimeLeft(45);
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
        <div className="bg-mantle rounded-3xl p-8 max-w-2xl shadow-material-lg border border-surface0">
          <h2 className="text-3xl font-bold text-mauve mb-6">Phase 2: The Working Memory Test</h2>
          <div className="text-text space-y-4 mb-8">
            <p className="text-lg">
              This test measures your <span className="text-peach font-semibold">working memory capacity</span> and 
              <span className="text-peach font-semibold"> cognitive flexibility</span>.
            </p>
            <div className="bg-surface0 rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-lavender">Instructions:</h3>
              <ul className="list-disc list-inside space-y-2 text-subtext1">
                <li>Letters will appear on screen every 1.5 seconds</li>
                <li>Press <kbd className="px-3 py-1 bg-mauve text-base rounded-lg font-mono">SPACE</kbd> if the current letter matches the letter shown <span className="text-peach font-bold">2 steps ago</span></li>
                <li>Example: If you see <span className="font-mono text-lavender">A → B → A</span>, press SPACE on the second A</li>
                <li>Stay focused and maintain the sequence in your mind</li>
              </ul>
            </div>
            <p className="text-subtext0 text-sm">Duration: 45 seconds</p>
          </div>
          <button
            onClick={startTest}
            className="w-full bg-mauve hover:bg-[#d4b4ff] text-base font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
          >
            Start Memory Test
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
      
      <div className="bg-mantle rounded-3xl w-full max-w-md aspect-square flex items-center justify-center shadow-material-lg border border-surface0">
        {isVisible && currentLetter && (
          <span className="text-9xl font-bold text-lavender animate-pulse">
            {currentLetter}
          </span>
        )}
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <p className="text-subtext1 text-sm">
          Press <kbd className="px-3 py-1 bg-surface0 rounded-lg font-mono">SPACE</kbd> if letter matches <span className="text-peach font-bold">2-back</span>
        </p>
        <div className="flex gap-2 justify-center">
          {testDataRef.current.sequence.slice(-3).map((letter, idx) => (
            <span key={idx} className="px-3 py-1 bg-surface0 rounded-lg font-mono text-text opacity-50">
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkingMemoryTest;
