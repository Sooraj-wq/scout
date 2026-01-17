import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logEvent } from '../utils/eventLogger';
import { useLanguage } from '../../../context/LanguageContext';

const Dots = ({ count, size = 40, color = '#a6e3a1' }) => {
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
              fill="#a6e3a1"
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
            fill="#a6e3a1"
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
  const { t } = useLanguage();

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
      className="flex flex-col items-center justify-center min-h-[500px] px-8 py-12 cursor-pointer"
      onClick={handleTap}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green mb-3">
          {t('dcLetsPlay')}
        </h2>
        <p className="text-lg text-subtext0">
          {t('dcTapSee')}
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 mb-8 shadow-material-lg min-h-[240px] flex items-center justify-center border border-surface1">
        {representation === 'dots' ? (
          <Dots count={currentCount} />
        ) : (
          <ObjectsDisplay count={currentCount} objectType="star" />
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentCount <= 1}
          className={`w-14 h-14 rounded-full border-none text-2xl transition-all duration-200 ${
            currentCount > 1 
              ? 'bg-surface1 text-text cursor-pointer hover:bg-surface2' 
              : 'glass-card text-subtext1 cursor-default'
          }`}
        >
          -
        </button>
        
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green text-base text-2xl font-semibold">
          {currentCount}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentCount >= 3}
          className={`w-14 h-14 rounded-full border-none text-2xl transition-all duration-200 ${
            currentCount < 3 
              ? 'bg-surface1 text-text cursor-pointer hover:bg-surface2' 
              : 'glass-card text-subtext1 cursor-default'
          }`}
        >
          +
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={(e) => { e.stopPropagation(); handleRepresentationChange('dots'); }}
          className={`px-6 py-3 rounded-3xl text-base transition-all duration-200 ${
            representation === 'dots'
              ? 'bg-surface1 text-text border-2 border-green'
              : 'glass-card text-text border-2 border-transparent hover:border-surface2'
          }`}
        >
          {t('dcDots')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleRepresentationChange('stars'); }}
          className={`px-6 py-3 rounded-3xl text-base transition-all duration-200 ${
            representation === 'stars'
              ? 'bg-surface1 text-text border-2 border-green'
              : 'glass-card text-text border-2 border-transparent hover:border-surface2'
          }`}
        >
          {t('dcStars')}
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleContinue(); }}
        className="px-12 py-4 rounded-full border-none bg-green hover:bg-teal text-base text-lg font-bold cursor-pointer transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
      >
        {t('dcReady')}
      </button>
    </div>
  );
};

export default WarmupFreePlay;
