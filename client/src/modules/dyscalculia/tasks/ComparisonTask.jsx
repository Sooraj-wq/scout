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
          fill="#89b4fa"
          className="transition-all duration-300"
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
    <div className="flex flex-col items-center justify-center min-h-full p-6 glass rounded-[28px]">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-normal text-text mb-2">
          Which has more?
        </h2>
        <p className="text-base text-subtext0">
          Tap the group with more dots
        </p>
      </div>

      <div className="flex gap-6 mb-12 items-center">
        <button
          onClick={() => handleSelect('left')}
          disabled={showFeedback}
          className={`p-5 rounded-3xl transition-all duration-300 shadow-material-lg ${
            showFeedback ? 'opacity-70' : 'opacity-100'
          } ${
            selected === 'left' 
              ? (isRightCorrect && selected === 'left' 
                ? 'border-[3px] border-yellow bg-yellow/20' 
                : 'border-[3px] border-mauve bg-surface1')
              : 'border-[3px] border-transparent glass-card'
          } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <DotsGroup count={leftCount} />
        </button>

        <div className="flex flex-col items-center gap-2 text-subtext1 text-sm">
          <span>or</span>
        </div>

        <button
          onClick={() => handleSelect('right')}
          disabled={showFeedback}
          className={`p-5 rounded-3xl transition-all duration-300 shadow-material-lg ${
            showFeedback ? 'opacity-70' : 'opacity-100'
          } ${
            selected === 'right' 
              ? (!isRightCorrect && selected === 'right' 
                ? 'border-[3px] border-yellow bg-yellow/20' 
                : 'border-[3px] border-mauve bg-surface1')
              : 'border-[3px] border-transparent glass-card'
          } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <DotsGroup count={rightCount} />
        </button>
      </div>

      {showFeedback && (
        <div className={`flex items-center gap-3 px-8 py-4 rounded-[28px] text-xl font-medium animate-[fadeIn_0.3s_ease] ${
          (selected === 'right' && isRightCorrect) || (selected === 'left' && !isRightCorrect)
            ? 'bg-green/20 text-green'
            : 'bg-yellow/20 text-yellow'
        }`}>
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
