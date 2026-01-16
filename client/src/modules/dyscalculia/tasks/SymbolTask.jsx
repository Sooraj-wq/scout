import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logTaskStart } from '../utils/eventLogger';

const DotsGroup = ({ count, size = 30 }) => {
  const positions = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = size + 8;
  const offsetX = (200 - gridSize * spacing) / 2;
  const offsetY = (120 - gridSize * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    positions.push({
      x: offsetX + col * spacing + spacing / 2,
      y: offsetY + row * spacing + spacing / 2
    });
  }

  return (
    <svg width="200" height="120" viewBox="0 0 200 120">
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={size / 2}
          fill="#89b4fa"
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
};

export const SymbolTask = ({ difficulty = 1, onComplete }) => {
  const [targetCount, setTargetCount] = useState(3);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [stressDetected, setStressDetected] = useState(false);
  const startTimeRef = useRef(null);
  const { addTaskAttempt, addStressIndicator } = useGameStore();

  const generateTask = (diff) => {
    let minCount, maxCount;

    if (diff <= 2) {
      minCount = 1;
      maxCount = 4;
    } else if (diff <= 4) {
      minCount = 1;
      maxCount = 6;
    } else if (diff <= 6) {
      minCount = 2;
      maxCount = 8;
    } else {
      minCount = 3;
      maxCount = 10;
    }

    const target = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

    const range = [];
    for (let i = minCount; i <= maxCount; i++) {
      if (i !== target) range.push(i);
    }
    
    const shuffled = range.sort(() => Math.random() - 0.5);
    const correctIndex = Math.floor(Math.random() * 3);
    const taskOptions = [...shuffled.slice(0, correctIndex), target, ...shuffled.slice(correctIndex, 2)];
    
    return { target, taskOptions };
  };

  useEffect(() => {
    const { target, taskOptions } = generateTask(difficulty);
    setTargetCount(target);
    setOptions(taskOptions);
    startTimeRef.current = Date.now();
    setStressDetected(false);

    logTaskStart({
      taskType: 'symbol',
      difficulty,
      targetCount: target,
      options: taskOptions
    });
  }, [difficulty]);

  const handleSelect = (num) => {
    // Note: Date.now() is allowed here as it's in event handler, not render
    const latency = Date.now() - startTimeRef.current;
    const isCorrect = num === targetCount;
    
    setSelected(num);
    setAttempts(prev => prev + 1);

    if (attempts > 0 && !isCorrect) {
      setStressDetected(true);
      addStressIndicator('symbol_frustration');
    }

    const attemptData = {
      taskType: 'symbol',
      correct: isCorrect,
      selectedAnswer: num,
      correctAnswer: targetCount,
      latency,
      attempts: attempts + 1,
      changedAnswer: false
    };

    addTaskAttempt(attemptData);

    if (isCorrect) {
      setShowFeedback(true);
      setTimeout(() => {
        onComplete && onComplete({ success: true, attempts: attempts + 1 });
      }, 1500);
    } else {
      setShowFeedback(true);
      if (attempts >= 2) {
        addStressIndicator('persistent_symbol_errors');
      }
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        startTimeRef.current = Date.now();
      }, 2500);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-full p-6 rounded-[28px] transition-all duration-500 ${
      stressDetected 
        ? 'bg-gradient-to-br from-yellow/20 to-yellow/40' 
        : 'bg-gradient-to-br from-mantle to-base'
    }`}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-normal text-text mb-2">
          Which number matches?
        </h2>
        <p className="text-base text-subtext0">
          Tap the number for these dots
        </p>
      </div>

      <div className="bg-surface0 rounded-3xl p-8 mb-8 shadow-material-lg">
        <DotsGroup count={targetCount} size={40} />
      </div>

      <div className="flex gap-4 flex-wrap justify-center max-w-[400px]">
        {options.map((num, index) => (
          <button
            key={index}
            onClick={() => handleSelect(num)}
            disabled={showFeedback}
            className={`w-[72px] h-[72px] rounded-[20px] text-text text-[32px] font-medium shadow-material transition-all duration-300 ${
              showFeedback ? 'opacity-70' : 'opacity-100'
            } ${
              selected === num 
                ? (num === targetCount 
                  ? 'border-[3px] border-green bg-green/20' 
                  : 'border-[3px] border-yellow bg-yellow/20')
                : 'border-[3px] border-transparent bg-surface0'
            } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {num}
          </button>
        ))}
      </div>

      {stressDetected && (
        <div className="mt-6 px-6 py-3 rounded-[20px] bg-yellow/20 text-yellow text-sm text-center">
          No worries! Take your time
        </div>
      )}

      {showFeedback && selected === targetCount && (
        <div className="mt-6 flex items-center gap-3 px-8 py-4 rounded-[28px] bg-green/20 text-green text-xl font-medium animate-[fadeIn_0.3s_ease]">
          <span>✓</span> Perfect!
        </div>
      )}

      {showFeedback && selected !== targetCount && (
        <div className="mt-6 flex items-center gap-3 px-8 py-4 rounded-[28px] bg-yellow/20 text-yellow text-xl font-medium animate-[fadeIn_0.3s_ease]">
          <span>↺</span> Try again!
        </div>
      )}
    </div>
  );
};

export default SymbolTask;
