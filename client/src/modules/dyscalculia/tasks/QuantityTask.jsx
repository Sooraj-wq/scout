import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logTaskStart, logTaskAnswer } from '../utils/eventLogger';

const DotsGroup = ({ count, size = 35, highlight = false }) => {
  const positions = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = size + 10;
  const offsetX = (280 - gridSize * spacing) / 2;
  const offsetY = (200 - gridSize * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    positions.push({
      x: offsetX + col * spacing + spacing / 2,
      y: offsetY + row * spacing + spacing / 2
    });
  }

  return (
    <svg width="280" height="200" viewBox="0 0 280 200">
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={size / 2}
          fill={highlight ? 'var(--catppuccin-magenta)' : 'var(--catppuccin-blue)'}
          style={{ 
            transition: 'all 0.3s ease',
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

    const target = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    
    const otherOptions = range.filter(n => n !== target);
    const shuffled = otherOptions.sort(() => Math.random() - 0.5);
    const correctIndex = Math.floor(Math.random() * 3);
    const taskOptions = [...shuffled.slice(0, correctIndex), target, ...shuffled.slice(correctIndex, 2)];
    
    return { target, taskOptions };
  };

  useEffect(() => {
    const { target, taskOptions } = generateTask(difficulty);
    setTargetCount(target);
    setOptions(taskOptions);
    startTimeRef.current = Date.now();
    
    logTaskStart({
      taskType: 'quantity',
      difficulty,
      targetCount: target,
      options: taskOptions
    });
  }, [difficulty]);

  const handleSelect = (count) => {
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
          Find the same amount
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Tap the group that matches
        </p>
      </div>

      <div style={{
        background: 'var(--catppuccin-surface0)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
      }}>
        <DotsGroup count={targetCount} size={45} />
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '400px'
      }}>
        {options.map((count, index) => (
          <button
            key={index}
            onClick={() => handleSelect(count)}
            disabled={showFeedback}
            style={{
              padding: '16px 24px',
              borderRadius: '20px',
              border: selected === count 
                ? (count === targetCount ? '3px solid var(--catppuccin-green)' : '3px solid var(--catppuccin-red)')
                : '3px solid transparent',
              background: selected === count 
                ? (count === targetCount ? 'rgba(166, 227, 161, 0.2)' : 'rgba(243, 139, 168, 0.2)')
                : 'var(--catppuccin-surface0)',
              cursor: showFeedback ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              opacity: showFeedback ? 0.7 : 1,
              transform: showFeedback ? 'scale(0.95)' : 'scale(1)'
            }}
          >
            <DotsGroup count={count} size={30} />
          </button>
        ))}
      </div>

      {showFeedback && selected === targetCount && (
        <div style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '28px',
          background: 'rgba(166, 227, 161, 0.2)',
          border: '2px solid var(--catppuccin-green)',
          color: 'var(--catppuccin-green)',
          fontSize: '20px',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✓</span> Perfect match!
        </div>
      )}

      {showFeedback && selected !== targetCount && (
        <div style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '28px',
          background: 'rgba(249, 226, 175, 0.2)',
          border: '2px solid var(--catppuccin-yellow)',
          color: 'var(--catppuccin-yellow)',
          fontSize: '20px',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>↺</span> Try again!
        </div>
      )}
    </div>
  );
};

export default QuantityTask;
