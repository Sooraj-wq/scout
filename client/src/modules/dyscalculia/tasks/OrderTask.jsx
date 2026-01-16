import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameState';
import { logTaskStart } from '../utils/eventLogger';

const DraggableNumber = ({ number, isPlaced, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', number);
        onDragStart && onDragStart(number);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-[28px] font-medium shadow-material transition-all duration-200 select-none ${
        isPlaced 
          ? 'bg-surface1 cursor-default opacity-50' 
          : isDragging 
            ? 'bg-blue scale-110 shadow-material-lg' 
            : 'bg-mauve scale-100'
      } ${!isPlaced ? 'cursor-grab' : ''} text-text`}
    >
      {number}
    </div>
  );
};

const DropZone = ({ position, number, onDrop }) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const droppedNumber = parseInt(e.dataTransfer.getData('text/plain'));
        onDrop(droppedNumber, position);
      }}
      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-[28px] font-medium transition-all duration-200 ${
        isOver 
          ? 'border-[3px] border-dashed border-mauve bg-surface1' 
          : number 
            ? 'border-[3px] border-solid border-mauve bg-surface1'
            : 'border-[3px] border-dashed border-subtext1 bg-surface0'
      } ${number ? 'text-text' : 'text-subtext1'}`}
    >
      {number || ''}
    </div>
  );
};

export const OrderTask = ({ difficulty = 1, onComplete }) => {
  const [sequence, setSequence] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const startTimeRef = useRef(null);
  const { addTaskAttempt, addStressIndicator } = useGameStore();

  const generateTask = (diff) => {
    let count, start;
    
    if (diff <= 2) {
      count = 3;
      start = 1;
    } else if (diff <= 4) {
      count = 4;
      start = 1;
    } else if (diff <= 6) {
      count = 5;
      start = 1;
    } else {
      count = 5;
      start = Math.floor(Math.random() * 3) + 1;
    }

    const correctSequence = Array.from({ length: count }, (_, i) => start + i);
    const newSequence = correctSequence.map((n, i) => ({ 
      value: n, 
      position: i,
      placed: null 
    }));
    
    const shuffled = [...correctSequence].sort(() => Math.random() - 0.5);
    const newAvailable = shuffled.map(n => ({ value: n, placed: false }));

    return { sequence: newSequence, availableNumbers: newAvailable };
  };

  useEffect(() => {
    const { sequence: newSeq, availableNumbers: newAvail } = generateTask(difficulty);
    setSequence(newSeq);
    setAvailableNumbers(newAvail);
    setAttempts(0);
    setErrorCount(0);
    setShowSuccess(false);
    startTimeRef.current = Date.now();

    logTaskStart({
      taskType: 'order',
      difficulty,
      sequence: newSeq.map(s => s.value),
      count: newSeq.length
    });
  }, [difficulty]);

  const handleDragStart = () => {
  };

  const handleDrop = (droppedNumber, positionIndex) => {
    const correctNumber = sequence[positionIndex].value;
    const isCorrect = droppedNumber === correctNumber;
    
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      const newSequence = [...sequence];
      newSequence[positionIndex] = { 
        ...newSequence[positionIndex], 
        placed: droppedNumber 
      };
      setSequence(newSequence);

      const newAvailable = availableNumbers.map(n => 
        n.value === droppedNumber ? { ...n, placed: true } : n
      );
      setAvailableNumbers(newAvailable);

      const allPlaced = newSequence.every(s => s.placed !== null);
      if (allPlaced) {
        const latency = Date.now() - startTimeRef.current;
        addTaskAttempt({
          taskType: 'order',
          correct: true,
          selectedAnswer: sequence.map(s => s.placed),
          correctAnswer: sequence.map(s => s.value),
          latency,
          attempts: attempts + 1,
          errorCount
        });
        setShowSuccess(true);
        setTimeout(() => {
          onComplete && onComplete({ success: true, attempts: attempts + 1 });
        }, 2000);
      }
    } else {
      setErrorCount(prev => prev + 1);
      if (errorCount >= 2) {
        addStressIndicator('order_errors');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-gradient-to-br from-mantle to-base rounded-[28px]">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-normal text-text mb-2">
          Put them in order
        </h2>
        <p className="text-base text-subtext0">
          Drag the numbers from smallest to largest
        </p>
      </div>

      <div className="flex gap-3 mb-12 flex-wrap justify-center max-w-[400px]">
        {sequence.map((item, index) => (
          <DropZone
            key={index}
            position={index}
            number={item.placed}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div className="flex gap-4 flex-wrap justify-center max-w-[400px]">
        {availableNumbers.map((num, index) => !num.placed && (
          <DraggableNumber
            key={index}
            number={num.value}
            isPlaced={num.placed}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {showSuccess && (
        <div className="mt-8 flex items-center gap-3 px-8 py-4 rounded-[28px] bg-green/20 text-green text-xl font-medium animate-[fadeIn_0.3s_ease]">
          <span>✓</span> All in order!
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

export default OrderTask;
