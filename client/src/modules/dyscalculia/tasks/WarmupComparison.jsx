import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logEvent } from '../utils/eventLogger';

const DotsGroup = ({ count, size = 30 }) => {
  const positions = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = size + 8;
  const offsetX = (300 - gridSize * spacing) / 2;
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
    <svg width="300" height="150" viewBox="0 0 300 150">
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

export const WarmupComparison = ({ onComplete }) => {
  const [selected, setSelected] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const startTimeRef = useRef(null);
  const { recordExposure } = useGameStore();
  
  const leftCount = 1;
  const rightCount = 3;

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    recordExposure({
      type: 'warmup_comparison',
      leftCount,
      rightCount,
      difficulty: 'easy'
    });
  }, [recordExposure]);

  const handleSelect = (side) => {
    const latency = Date.now() - startTimeRef.current;
    setSelected(side);

    const isCorrect = (side === 'right' && rightCount > leftCount) ||
                      (side === 'left' && leftCount > rightCount);

    logEvent({
      type: 'warmup_comparison_answer',
      side,
      leftCount,
      rightCount,
      correct: isCorrect,
      latency
    });

    if (isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        onComplete({
          comparisonAbility: latency < 3000 ? 'good' : latency < 6000 ? 'ok' : 'slow',
          hesitationTime: latency
        });
      }, 1500);
    } else {
      setTimeout(() => {
        setSelected(null);
        startTimeRef.current = Date.now();
      }, 1000);
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
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '400',
          color: 'var(--catppuccin-text)',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Which has more?
        </h2>
        <p style={{
          fontSize: '18px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Tap the group with more dots
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '32px',
        marginBottom: '48px'
      }}>
        <button
          onClick={() => handleSelect('left')}
          style={{
            padding: '24px',
            borderRadius: '24px',
            border: selected === 'left' 
              ? '4px solid var(--catppuccin-magenta)' 
              : showSuccess && leftCount > rightCount
                ? '4px solid var(--catppuccin-green)'
                : '4px solid transparent',
            background: 'var(--catppuccin-surface0)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}
        >
          <DotsGroup count={leftCount} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--catppuccin-subtext1)',
          fontSize: '24px'
        }}>
          or
        </div>

        <button
          onClick={() => handleSelect('right')}
          style={{
            padding: '24px',
            borderRadius: '24px',
            border: selected === 'right' 
              ? '4px solid var(--catppuccin-magenta)' 
              : showSuccess && rightCount > leftCount
                ? '4px solid var(--catppuccin-green)'
                : '4px solid transparent',
            background: 'var(--catppuccin-surface0)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}
        >
          <DotsGroup count={rightCount} />
        </button>
      </div>

      {showSuccess && (
        <div style={{
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
          <span>✓</span> Great job!
        </div>
      )}

      {!showSuccess && selected !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '28px',
          background: 'rgba(249, 226, 175, 0.2)',
          color: 'var(--catppuccin-yellow)',
          fontSize: '20px',
          fontWeight: '500'
        }}>
          <span>Try again!</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default WarmupComparison;
