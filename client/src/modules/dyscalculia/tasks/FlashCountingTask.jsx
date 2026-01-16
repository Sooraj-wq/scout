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
      fill={visible ? 'var(--catppuccin-blue)' : 'var(--catppuccin-surface0)'}
      style={{ 
        transition: 'all 0.1s ease'
      }}
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '24px',
      background: 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
      borderRadius: '28px'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '400',
          color: 'var(--catppuccin-text)',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {isFlashing ? 'Count the flashes...' : 'How many flashes?'}
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {isFlashing 
            ? `Pay attention! (${(flashDuration / 1000).toFixed(1)} seconds)`
            : 'Type the number you saw'
          }
        </p>
      </div>

      <div style={{
        background: 'var(--catppuccin-surface0)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        width: '280px',
        height: '200px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <svg width="280" height="200" viewBox="0 0 280 200">
          {/* Optional: subtle boundary lines */}
          <rect
            x="35"
            y="35"
            width="210"
            height="130"
            fill="none"
            stroke="var(--catppuccin-surface1)"
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
              style={{
                fontSize: '14px',
                color: 'var(--catppuccin-subtext0)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {!showFeedback && 'Waiting for you to start...'}
            </text>
          )}
        </svg>
      </div>

      {!isFlashing && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter number"
              disabled={showFeedback}
              style={{
                padding: '12px 20px',
                borderRadius: '16px',
                border: '2px solid var(--catppuccin-surface1)',
                background: 'var(--catppuccin-surface0)',
                color: 'var(--catppuccin-text)',
                fontSize: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                width: '150px',
                textAlign: 'center'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || showFeedback}
              style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: '2px solid var(--catppuccin-blue)',
                background: inputValue.trim() && !showFeedback ? 'var(--catppuccin-blue)' : 'transparent',
                color: inputValue.trim() && !showFeedback ? 'var(--catppuccin-base)' : 'var(--catppuccin-blue)',
                fontSize: '16px',
                fontWeight: '500',
                cursor: inputValue.trim() && !showFeedback ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
              }}
            >
              Submit
            </button>
          </form>

          {!isFlashing && !showFeedback && (
            <button
              onClick={startFlashing}
              style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: '2px solid var(--catppuccin-green)',
                background: 'transparent',
                color: 'var(--catppuccin-green)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Start Flashing
            </button>
          )}
        </div>
      )}

      {showFeedback && (
        <div style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '28px',
          background: parseInt(inputValue, 10) === targetCount 
            ? 'rgba(166, 227, 161, 0.2)' 
            : 'rgba(249, 226, 175, 0.2)',
          border: `2px solid ${parseInt(inputValue, 10) === targetCount ? 'var(--catppuccin-green)' : 'var(--catppuccin-yellow)'}`,
          color: parseInt(inputValue, 10) === targetCount ? 'var(--catppuccin-green)' : 'var(--catppuccin-yellow)',
          fontSize: '20px',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
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
