import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logTaskStart, logTaskAnswer, getFlashDuration } from '../utils/eventLogger';

const FlashingDot = ({ x, y, size, isFlashing, delay }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isFlashing) {
      const timer = setTimeout(() => {
        setVisible(true);
        setTimeout(() => setVisible(false), 400); // Flash duration 0.4s
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isFlashing, delay]);

  return (
    <circle
      cx={x}
      cy={y}
      r={size / 2}
      fill={visible ? '#89b4fa' : '#313244'}
      className="transition-all duration-100"
    />
  );
};

export const FlashCountingTask = ({ difficulty = 1, onComplete }) => {
  const [targetCount, setTargetCount] = useState(2);
  const [isFlashing, setIsFlashing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [flashDuration, setFlashDuration] = useState(3000);
  const startTimeRef = useRef(null);
  const { addTaskAttempt, addStressIndicator, sessionId } = useGameStore();
  
  // Use useRef to store random state to avoid impure calls
  const randomRef = useRef(Math.random());

  const generateTask = async (diff) => {
    let maxCount, minCount;
    
    if (diff <= 2) {
      maxCount = 4;
      minCount = 1;
    } else if (diff <= 4) {
      maxCount = 6;
      minCount = 2;
    } else if (diff <= 6) {
      maxCount = 8;
      minCount = 3;
    } else {
      maxCount = 12;
      minCount = 5;
    }

    // Get adaptive flash duration from backend
    let duration = 3000; // fallback default
    if (sessionId) {
      try {
        const durationInfo = await getFlashDuration(sessionId, diff);
        duration = durationInfo.duration_ms;
        console.log('Flash duration from backend:', duration, 'ms -', durationInfo.adjustment_reason);
      } catch (error) {
        console.error('Failed to get flash duration from backend, using default:', error);
      }
    }

    const target = Math.floor(randomRef.current * (maxCount - minCount + 1)) + minCount;
    setFlashDuration(duration);
    
    return { target, duration };
  };

  useEffect(() => {
    const initializeTask = async () => {
      const { target, duration } = await generateTask(difficulty);
      setTargetCount(target);
      setInputValue('');
      setShowFeedback(false);
      setAttempts(0);
      // Note: Date.now() is allowed here as it's in event handler, not render
      startTimeRef.current = Date.now();
      
      logTaskStart({
        taskType: 'flash_counting',
        difficulty,
        targetCount: target,
        flashDuration: duration
      });
    };
    
    initializeTask();
  }, [difficulty, sessionId]);

  const startFlashing = () => {
    setIsFlashing(true);
    
    // Stop flashing after all dots have flashed
    // Each dot flashes every 0.4s (400ms), plus 0.4s flash duration
    const totalFlashTime = targetCount * 400 + 400;
    setTimeout(() => {
      setIsFlashing(false);
      // Note: Date.now() is allowed here as it's in event handler, not render
      startTimeRef.current = Date.now();
    }, totalFlashTime);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userAnswer = parseInt(inputValue, 10);
    // Note: Date.now() is allowed here as it's in event handler, not render
    const latency = Date.now() - startTimeRef.current;
    const isCorrect = userAnswer === targetCount;
    
    setShowFeedback(true);
    setAttempts(prev => prev + 1);

    const attemptData = {
      taskType: 'flash_counting',
      correct: isCorrect,
      selectedAnswer: userAnswer,
      correctAnswer: targetCount,
      latency,
      attempts: attempts + 1,
      flashDuration
    };

    addTaskAttempt(attemptData);
    logTaskAnswer(attemptData);

    if (isCorrect) {
      setTimeout(() => {
        onComplete && onComplete({ success: true, attempts: attempts + 1 });
      }, 1500);
    } else {
      if (attempts >= 1) {
        addStressIndicator('repeated_flash_errors');
      }
      setTimeout(() => {
        setShowFeedback(false);
        setInputValue('');
        startFlashing();
      }, 2000);
    }
  };

  const generateRandomPositions = (count) => {
    const positions = [];

    // GUARANTEED NO OVERLAP: Use pure grid-based positioning
    const containerWidth = 280;
    const containerHeight = 200;
    const dotSize = 30;
    
    // Calculate grid dimensions that can fit all dots with safe spacing
    const gridCols = Math.ceil(Math.sqrt(count * (containerWidth / containerHeight)));
    const gridRows = Math.ceil(count / gridCols);
    
    // Calculate cell size (including dot size + minimum spacing)
    const cellWidth = containerWidth / gridCols;
    const cellHeight = containerHeight / gridRows;
    
    // Ensure dots fit within cells with padding
    const effectiveSize = Math.min(dotSize, cellWidth * 0.6, cellHeight * 0.6);
    
    // Place dots in grid cells with guaranteed spacing
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      
      // Center of each cell
      const centerX = col * cellWidth + cellWidth / 2;
      const centerY = row * cellHeight + cellHeight / 2;
      
      // Add small random offset (max 15% of cell size) for natural look
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

    return positions;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-gradient-to-br from-mantle to-base rounded-[28px]">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-normal text-text mb-2">
          {isFlashing ? 'Count the flashes...' : 'How many flashes?'}
        </h2>
        <p className="text-base text-subtext0">
          {isFlashing 
            ? `Pay attention! (${(flashDuration / 1000).toFixed(1)} seconds)`
            : 'Type the number you saw'
          }
        </p>
      </div>

      <div className="bg-surface0 rounded-3xl p-8 mb-6 shadow-material-lg w-[280px] h-[200px] relative overflow-hidden">
        <svg width="280" height="200" viewBox="0 0 280 200">
          {/* Optional: subtle boundary lines */}
          <rect
            x="35"
            y="35"
            width="210"
            height="130"
            fill="none"
            stroke="#45475a"
            strokeWidth="1"
            opacity="0.05"
            rx="8"
          />

          {isFlashing && generateRandomPositions(targetCount).map((pos, i) => (
            <FlashingDot
              key={i}
              x={pos.x}
              y={pos.y}
              size={pos.size}
              isFlashing={isFlashing}
              delay={i * 400} // Flash every 0.4s (400ms)
            />
          ))}

          {!isFlashing && (
            <text
              x="140"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm text-subtext0"
            >
              {!showFeedback && 'Waiting for you to start...'}
            </text>
          )}
        </svg>
      </div>

      {!isFlashing && (
        <div className="flex flex-col items-center gap-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter number"
              disabled={showFeedback}
              className="px-5 py-3 rounded-2xl border-2 border-surface1 bg-surface0 text-text text-base w-[150px] text-center"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || showFeedback}
              className={`px-6 py-3 rounded-2xl border-2 text-base font-medium transition-all duration-300 ${
                inputValue.trim() && !showFeedback
                  ? 'border-blue bg-blue text-base cursor-pointer'
                  : 'border-blue bg-transparent text-blue cursor-default'
              }`}
            >
              Submit
            </button>
          </form>

          {!isFlashing && !showFeedback && (
            <button
              onClick={startFlashing}
              className="px-6 py-3 rounded-2xl border-2 border-green bg-transparent text-green text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-green/10"
            >
              Start Flashing
            </button>
          )}
        </div>
      )}

      {showFeedback && (
        <div className={`mt-6 flex items-center gap-3 px-8 py-4 rounded-[28px] border-2 text-xl font-medium animate-[fadeIn_0.3s_ease] ${
          parseInt(inputValue, 10) === targetCount 
            ? 'bg-green/20 border-green text-green' 
            : 'bg-yellow/20 border-yellow text-yellow'
        }`}>
          <span>{parseInt(inputValue, 10) === targetCount ? '✓' : '✗'}</span>
          {parseInt(inputValue, 10) === targetCount 
            ? (
            <>
              <span>✓</span> Great job!
            </>

            ) : (
            <>
              <span>↺</span> Try again!
            </>
            )
          }
        </div>
      )}
    </div>
  );
};

export default FlashCountingTask;
