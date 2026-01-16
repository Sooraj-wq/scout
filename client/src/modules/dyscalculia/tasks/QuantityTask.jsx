import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logTaskStart, logTaskAnswer } from '../utils/eventLogger';

const DotsGroup = ({ count, size = 35, highlight = false }) => {
  // Use useRef to store random state to avoid impure calls
  const randomRef = useRef(Math.random());

  const positions = [];

  // GUARANTEED NO OVERLAP: Use pure grid-based positioning
  const containerWidth = 280;
  const containerHeight = 200;
  
  // Calculate grid dimensions that can fit all dots with safe spacing
  const gridCols = Math.ceil(Math.sqrt(count * (containerWidth / containerHeight)));
  const gridRows = Math.ceil(count / gridCols);
  
  // Calculate cell size (including dot size + minimum spacing)
  const cellWidth = containerWidth / gridCols;
  const cellHeight = containerHeight / gridRows;
  
  // Ensure dots fit within cells with padding
  const effectiveSize = Math.min(size, cellWidth * 0.6, cellHeight * 0.6);
  
  // Place dots in grid cells with guaranteed spacing
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridCols);
    const col = i % gridCols;
    
    // Center of each cell
    const centerX = col * cellWidth + cellWidth / 2;
    const centerY = row * cellHeight + cellHeight / 2;
    
    // Add small random offset (max 20% of cell size) for natural look
    // but keep within safe bounds to prevent overlap
    const maxOffset = Math.min(cellWidth, cellHeight) * 0.15;
    const offsetX = (randomRef.current - 0.5) * maxOffset;
    randomRef.current = Math.random();
    const offsetY = (randomRef.current - 0.5) * maxOffset;
    randomRef.current = Math.random();
    
    positions.push({
      x: centerX + offsetX,
      y: centerY + offsetY,
      size: effectiveSize
    });
  }

  return (
    <svg width="280" height="200" viewBox="0 0 280 200">
      {/* Optional: subtle boundary lines */}
      <rect
        x="5"
        y="5"
        width="270"
        height="190"
        fill="none"
        stroke="#45475a"
        strokeWidth="1"
        opacity="0.05"
        rx="8"
      />

      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={pos.size / 2}
          fill={highlight ? '#cba6f7' : '#89b4fa'}
          className="transition-all duration-300"
          style={{
            filter: highlight ? 'drop-shadow(0 0 8px rgba(127, 103, 190, 0.5))' : 'none'
          }}
        />
      ))}
    </svg>
  );
};

export const QuantityTask = ({ difficulty = 1, onComplete }) => {
  const [targetCount, setTargetCount] = useState(2);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const startTimeRef = useRef(null);
  const { addTaskAttempt, addStressIndicator } = useGameStore();
  
  // Use useRef to store random state to avoid impure calls
  const randomRef = useRef(Math.random());

  const generateTask = (diff) => {
    let maxCount, minCount, range;
    
    if (diff <= 2) {
      maxCount = 4;
      minCount = 1;
      range = [1, 2, 3, 4];
    } else if (diff <= 4) {
      maxCount = 6;
      minCount = 1;
      range = [1, 2, 3, 4, 5, 6];
    } else if (diff <= 6) {
      maxCount = 8;
      minCount = 2;
      range = [2, 3, 4, 5, 6, 7, 8];
    } else {
      maxCount = 10;
      minCount = 3;
      range = [3, 4, 5, 6, 7, 8, 9, 10];
    }

    const target = Math.floor(randomRef.current * (maxCount - minCount + 1)) + minCount;
    
    const otherOptions = range.filter(n => n !== target);
    const shuffled = otherOptions.sort(() => randomRef.current - 0.5);
    const correctIndex = Math.floor(randomRef.current * 3);
    const taskOptions = [...shuffled.slice(0, correctIndex), target, ...shuffled.slice(correctIndex, 2)];
    
    return { target, taskOptions };
  };

  useEffect(() => {
    const { target, taskOptions } = generateTask(difficulty);
    setTargetCount(target);
    setOptions(taskOptions);
    // Note: Date.now() is allowed here as it's in event handler, not render
    startTimeRef.current = Date.now();
    
    logTaskStart({
      taskType: 'quantity',
      difficulty,
      targetCount: target,
      options: taskOptions
    });
  }, [difficulty]);

  const handleSelect = (count) => {
    // Note: Date.now() is allowed here as it's in event handler, not render
    const latency = Date.now() - startTimeRef.current;
    const isCorrect = count === targetCount;
    
    setSelected(count);
    setAttempts(prev => prev + 1);

    const attemptData = {
      taskType: 'quantity',
      correct: isCorrect,
      selectedAnswer: count,
      correctAnswer: targetCount,
      latency,
      attempts: attempts + 1,
      changedAnswer: false
    };

    addTaskAttempt(attemptData);
    logTaskAnswer(attemptData);

    if (isCorrect) {
      setShowFeedback(true);
      setTimeout(() => {
        onComplete && onComplete({ success: true, attempts: attempts + 1 });
      }, 1500);
    } else {
      setShowFeedback(true);
      if (attempts >= 1) {
        addStressIndicator('repeated_errors');
      }
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        startTimeRef.current = Date.now();
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-gradient-to-br from-mantle to-base rounded-[28px]">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-normal text-text mb-2">
          Find the same amount
        </h2>
        <p className="text-base text-subtext0">
          Tap the group that matches
        </p>
      </div>

      <div className="bg-surface0 rounded-3xl p-8 mb-8 shadow-material-lg">
        <DotsGroup count={targetCount} size={45} />
      </div>

      <div className="flex gap-4 flex-wrap justify-center max-w-[400px]">
        {options.map((count, index) => (
          <button
            key={index}
            onClick={() => handleSelect(count)}
            disabled={showFeedback}
            className={`p-4 rounded-[20px] transition-all duration-300 shadow-material ${
              showFeedback ? 'opacity-70 scale-95' : 'opacity-100 scale-100'
            } ${
              selected === count 
                ? (count === targetCount 
                  ? 'border-[3px] border-green bg-green/20' 
                  : 'border-[3px] border-red bg-red/20')
                : 'border-[3px] border-transparent bg-surface0'
            } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <DotsGroup count={count} size={30} />
          </button>
        ))}
      </div>

      {showFeedback && selected === targetCount && (
        <div className="mt-6 flex items-center gap-3 px-8 py-4 rounded-[28px] bg-green/20 border-2 border-green text-green text-xl font-medium animate-[fadeIn_0.3s_ease]">
          <span>✓</span> Perfect match!
        </div>
      )}

      {showFeedback && selected !== targetCount && (
        <div className="mt-6 flex items-center gap-3 px-8 py-4 rounded-[28px] bg-yellow/20 border-2 border-yellow text-yellow text-xl font-medium animate-[fadeIn_0.3s_ease]">
          <span>↺</span> Try again!
        </div>
      )}
    </div>
  );
};

export default QuantityTask;