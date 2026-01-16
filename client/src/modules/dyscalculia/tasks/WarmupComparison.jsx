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
          fill="#89b4fa"
          className="transition-all duration-300"
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
    <div className="flex flex-col items-center justify-center min-h-full p-6 glass rounded-[28px]">
      <div className="mb-8 text-center">
        <h2 className="text-[28px] font-normal text-text mb-2">
          Which has more?
        </h2>
        <p className="text-lg text-subtext0">
          Tap the group with more dots
        </p>
      </div>

      <div className="flex gap-8 mb-12">
        <button
          onClick={() => handleSelect('left')}
          className={`p-6 rounded-3xl transition-all duration-300 shadow-material-lg cursor-pointer glass-card ${
            selected === 'left' 
              ? 'border-[4px] border-mauve' 
              : showSuccess && leftCount > rightCount
                ? 'border-[4px] border-green'
                : 'border-[4px] border-transparent'
          }`}
        >
          <DotsGroup count={leftCount} />
        </button>

        <div className="flex items-center text-subtext1 text-2xl">
          or
        </div>

        <button
          onClick={() => handleSelect('right')}
          className={`p-6 rounded-3xl transition-all duration-300 shadow-material-lg cursor-pointer glass-card ${
            selected === 'right' 
              ? 'border-[4px] border-mauve' 
              : showSuccess && rightCount > leftCount
                ? 'border-[4px] border-green'
                : 'border-[4px] border-transparent'
          }`}
        >
          <DotsGroup count={rightCount} />
        </button>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-3 px-8 py-4 rounded-[28px] bg-green/20 text-green text-xl font-medium animate-[fadeIn_0.3s_ease]">
          <span>✓</span> Great job!
        </div>
      )}

      {!showSuccess && selected !== null && (
        <div className="flex items-center gap-3 px-8 py-4 rounded-[28px] bg-yellow/20 text-yellow text-xl font-medium">
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
