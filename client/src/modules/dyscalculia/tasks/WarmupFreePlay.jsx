import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logEvent } from '../utils/eventLogger';

const Dots = ({ count, size = 40, color = 'var(--catppuccin-blue)' }) => {
  const positions = [];
  const centerX = 100;
  const centerY = 100;
  const radius = 50;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.push({ x, y });
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={size / 2}
          fill={color}
          style={{ transition: 'all 0.3s ease' }}
        />
      ))}
    </svg>
  );
};

const ObjectsDisplay = ({ count, objectType = 'star' }) => {
  const positions = [];
  const centerX = 100;
  const centerY = 100;
  const radius = 50;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.push({ x, y });
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {positions.map((pos, i) => {
        if (objectType === 'star') {
          return (
            <text
              key={i}
              x={pos.x}
              y={pos.y}
              fontSize="40"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--catppuccin-blue)"
            >
              ⭐
            </text>
          );
        }
        return (
          <circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r="20"
            fill="var(--catppuccin-blue)"
          />
        );
      })}
    </svg>
  );
};

export const WarmupFreePlay = ({ onComplete }) => {
  const [currentCount, setCurrentCount] = useState(1);
  const [representation, setRepresentation] = useState('dots');
  const [interactions, setInteractions] = useState(0);
  const startTimeRef = useRef(null);
  const { recordExposure } = useGameStore();

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    recordExposure({
      type: 'free_play',
      representation,
      count: currentCount
    });
  }, [currentCount, representation, recordExposure]);

  const handleTap = () => {
    setInteractions(prev => prev + 1);
    logEvent({
      type: 'warmup_interaction',
      representation,
      count: currentCount,
      action: 'tap'
    });
  };

  const handleNext = () => {
    if (currentCount < 3) {
      setCurrentCount(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentCount > 1) {
      setCurrentCount(prev => prev - 1);
    }
  };

  const handleRepresentationChange = (newRep) => {
    setRepresentation(newRep);
    logEvent({
      type: 'warmup_representation_change',
      from: representation,
      to: newRep
    });
  };

  const handleContinue = () => {
    const duration = Date.now() - startTimeRef.current;
    onComplete({
      interactionAbility: interactions > 2 ? 'good' : interactions > 0 ? 'minimal' : 'none',
      preferredRepresentation: representation,
      duration,
      interactions
    });
  };

  return (
    <div 
      className="warmup-freeplay"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '24px',
        background: 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
        borderRadius: '28px',
        cursor: representation === 'dots' ? 'default' : 'pointer'
      }}
      onClick={handleTap}
    >
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '400',
          color: 'var(--catppuccin-text)',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Let's play with numbers!
        </h2>
        <p style={{
          fontSize: '18px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Tap to see more, or choose below
        </p>
      </div>

      <div style={{
        background: 'var(--catppuccin-surface0)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        marginBottom: '32px',
        minHeight: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {representation === 'dots' ? (
          <Dots count={currentCount} />
        ) : (
          <ObjectsDisplay count={currentCount} objectType="star" />
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            background: currentCount > 1 ? 'var(--catppuccin-surface1)' : 'var(--catppuccin-surface0)',
            color: currentCount > 1 ? 'var(--catppuccin-text)' : 'var(--catppuccin-subtext1)',
            fontSize: '24px',
            cursor: currentCount > 1 ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
        >
          -
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'var(--catppuccin-magenta)',
          color: 'var(--catppuccin-text)',
          fontSize: '24px',
          fontWeight: '500'
        }}>
          {currentCount}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            background: currentCount < 3 ? 'var(--catppuccin-surface1)' : 'var(--catppuccin-surface0)',
            color: currentCount < 3 ? 'var(--catppuccin-text)' : 'var(--catppuccin-subtext1)',
            fontSize: '24px',
            cursor: currentCount < 3 ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
        >
          +
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleRepresentationChange('dots'); }}
          style={{
            padding: '12px 24px',
            borderRadius: '24px',
            border: representation === 'dots' ? '2px solid var(--catppuccin-blue)' : '2px solid transparent',
            background: representation === 'dots' ? 'var(--catppuccin-surface1)' : 'var(--catppuccin-surface0)',
            color: 'var(--catppuccin-text)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Dots
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleRepresentationChange('stars'); }}
          style={{
            padding: '12px 24px',
            borderRadius: '24px',
            border: representation === 'stars' ? '2px solid var(--catppuccin-blue)' : '2px solid transparent',
            background: representation === 'stars' ? 'var(--catppuccin-surface1)' : 'var(--catppuccin-surface0)',
            color: 'var(--catppuccin-text)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Stars
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleContinue(); }}
        style={{
          padding: '16px 48px',
          borderRadius: '28px',
          border: 'none',
          background: 'var(--catppuccin-magenta)',
          color: 'var(--catppuccin-text)',
          fontSize: '18px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        Ready to play! →
      </button>
    </div>
  );
};

export default WarmupFreePlay;
