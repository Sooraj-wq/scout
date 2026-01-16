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
          fill="var(--catppuccin-blue)"
          style={{ transition: 'all 0.3s ease' }}
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '24px',
      background: stressDetected 
        ? 'linear-gradient(135deg, rgba(249, 226, 175, 0.2) 0%, rgba(249, 226, 175, 0.4) 100%)'
        : 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
      borderRadius: '28px',
      transition: 'background 0.5s ease'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '400',
          color: 'var(--catppuccin-text)',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Which number matches?
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Tap the number for these dots
        </p>
      </div>

      <div style={{
        background: 'var(--catppuccin-surface0)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
      }}>
        <DotsGroup count={targetCount} size={40} />
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '400px'
      }}>
        {options.map((num, index) => (
          <button
            key={index}
            onClick={() => handleSelect(num)}
            disabled={showFeedback}
            style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            border: selected === num 
              ? (num === targetCount ? '3px solid var(--catppuccin-green)' : '3px solid var(--catppuccin-yellow)')
              : '3px solid transparent',
            background: selected === num 
              ? (num === targetCount ? 'rgba(166, 227, 161, 0.2)' : 'rgba(249, 226, 175, 0.2)')
              : 'var(--catppuccin-surface0)',
            color: 'var(--catppuccin-text)',
            fontSize: '32px',
            fontWeight: '500',
            cursor: showFeedback ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            opacity: showFeedback ? 0.7 : 1,
            fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {stressDetected && (
        <div style={{
          marginTop: '24px',
          padding: '12px 24px',
          borderRadius: '20px',
          background: 'rgba(249, 226, 175, 0.2)',
          color: 'var(--catppuccin-yellow)',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          No worries! Take your time
        </div>
      )}

      {showFeedback && selected === targetCount && (
        <div style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '28px',
          background: 'rgba(166, 227, 161, 0.2)',
          color: 'var(--catppuccin-green)',
          fontSize: '20px',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✓</span> Perfect!
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

export default SymbolTask;
