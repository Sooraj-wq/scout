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
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: isPlaced 
          ? 'var(--catppuccin-surface1)' 
          : isDragging 
            ? 'var(--catppuccin-blue)' 
            : 'var(--catppuccin-magenta)',
        color: 'var(--catppuccin-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: '500',
        cursor: isPlaced ? 'default' : 'grab',
        opacity: isPlaced ? 0.5 : 1,
        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(0,0,0,0.25)' 
          : '0 4px 12px rgba(0,0,0,0.25)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none'
      }}
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
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        border: isOver 
          ? '3px dashed var(--catppuccin-magenta)' 
          : number 
            ? '3px solid var(--catppuccin-magenta)'
            : '3px dashed var(--catppuccin-subtext1)',
        background: isOver 
          ? 'var(--catppuccin-surface1)' 
          : number 
            ? 'var(--catppuccin-surface1)'
            : 'var(--catppuccin-surface0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: '500',
        color: number ? 'var(--catppuccin-text)' : 'var(--catppuccin-subtext1)',
        transition: 'all 0.2s ease',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
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
          Put them in order
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Drag the numbers from smallest to largest
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '48px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '400px'
      }}>
        {sequence.map((item, index) => (
          <DropZone
            key={index}
            position={index}
            number={item.placed}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '400px'
      }}>
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
        <div style={{
          marginTop: '32px',
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
