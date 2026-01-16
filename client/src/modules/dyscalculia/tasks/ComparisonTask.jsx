import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logTaskStart } from '../utils/eventLogger';

const DotsGroup = ({ count, size = 35 }) => {
  const positions = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = size + 8;
  const offsetX = (200 - gridSize * spacing) / 2;
  const offsetY = (150 - gridSize * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    positions.push({
      x: offsetX + col * spacing + spacing / 2,
      y: offsetY + row * spacing + spacing / 2
    });
  }

  return (
    <svg width="200" height="150" viewBox="0 0 200 150">
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

export const ComparisonTask = ({ difficulty = 1, onComplete }) => {
  const [leftCount, setLeftCount] = useState(2);
  const [rightCount, setRightCount] = useState(5);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const startTimeRef = useRef(null);
  const { addTaskAttempt, addStressIndicator } = useGameStore();

  const generateTask = (diff) => {
    let minCount, maxCount, gap;

    if (diff <= 2) {
      minCount = 1;
      maxCount = 4;
      gap = 2;
    } else if (diff <= 4) {
      minCount = 2;
      maxCount = 6;
      gap = 1;
    } else if (diff <= 6) {
      minCount = 3;
      maxCount = 8;
      gap = 1;
    } else {
      minCount = 4;
      maxCount = 10;
      gap = 0;
    }

    let left, right;
    do {
      left = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
      right = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    } while (Math.abs(left - right) < gap || left === right);

    return { left, right };
  };

  useEffect(() => {
    const { left, right } = generateTask(difficulty);
    setLeftCount(left);
    setRightCount(right);
    startTimeRef.current = Date.now();

    logTaskStart({
      taskType: 'comparison',
      difficulty,
      leftCount: left,
      rightCount: right
    });
  }, [difficulty]);

  const handleSelect = (side) => {
    const latency = Date.now() - startTimeRef.current;
    const correct = (side === 'right' && rightCount > leftCount) ||
                    (side === 'left' && leftCount > rightCount);
    
    setSelected(side);
    setAttempts(prev => prev + 1);

    const attemptData = {
      taskType: 'comparison',
      correct,
      selectedAnswer: side,
      correctAnswer: rightCount > leftCount ? 'right' : 'left',
      latency,
      attempts: attempts + 1,
      changedAnswer: false,
      leftCount,
      rightCount
    };

    addTaskAttempt(attemptData);

    if (correct) {
      setShowFeedback(true);
      setTimeout(() => {
        onComplete && onComplete({ success: true, attempts: attempts + 1 });
      }, 1500);
    } else {
      setShowFeedback(true);
      if (attempts >= 1) {
        addStressIndicator('comparison_errors');
      }
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        startTimeRef.current = Date.now();
      }, 2000);
    }
  };

  const isRightCorrect = rightCount > leftCount;

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
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '400',
          color: 'var(--catppuccin-text)',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Which has more?
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Tap the group with more dots
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '48px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => handleSelect('left')}
          disabled={showFeedback}
          style={{
            padding: '20px',
            borderRadius: '24px',
            border: selected === 'left' 
              ? (isRightCorrect && selected === 'left' ? '3px solid var(--catppuccin-yellow)' : '3px solid var(--catppuccin-magenta)')
              : '3px solid transparent',
            background: selected === 'left' 
              ? (isRightCorrect && selected === 'left' ? 'rgba(249, 226, 175, 0.2)' : 'var(--catppuccin-surface1)')
              : 'var(--catppuccin-surface0)',
            cursor: showFeedback ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            opacity: showFeedback ? 0.7 : 1
          }}
        >
          <DotsGroup count={leftCount} />
        </button>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--catppuccin-subtext1)',
          fontSize: '14px'
        }}>
          <span>or</span>
        </div>

        <button
          onClick={() => handleSelect('right')}
          disabled={showFeedback}
          style={{
            padding: '20px',
            borderRadius: '24px',
            border: selected === 'right' 
              ? (!isRightCorrect && selected === 'right' ? '3px solid var(--catppuccin-yellow)' : '3px solid var(--catppuccin-magenta)')
              : '3px solid transparent',
            background: selected === 'right' 
              ? (!isRightCorrect && selected === 'right' ? 'rgba(249, 226, 175, 0.2)' : 'var(--catppuccin-surface1)')
              : 'var(--catppuccin-surface0)',
            cursor: showFeedback ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            opacity: showFeedback ? 0.7 : 1
          }}
        >
          <DotsGroup count={rightCount} />
        </button>
      </div>

      {showFeedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '28px',
          background: (selected === 'right' && isRightCorrect) || (selected === 'left' && !isRightCorrect)
            ? 'rgba(166, 227, 161, 0.2)'
            : 'rgba(249, 226, 175, 0.2)',
          color: (selected === 'right' && isRightCorrect) || (selected === 'left' && !isRightCorrect)
            ? 'var(--catppuccin-green)'
            : 'var(--catppuccin-yellow)',
          fontSize: '20px',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
          {(selected === 'right' && isRightCorrect) || (selected === 'left' && !isRightCorrect) ? (
            <>
              <span>✓</span> Great job!
            </>
          ) : (
            <>
              <span>↺</span> Try again!
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparisonTask;
