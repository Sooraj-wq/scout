import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands, HAND_CONNECTIONS, RESULTS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useLanguage } from '../../../context/LanguageContext';

const AirCanvas = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [color, setColor] = useState("#209fb5"); 
    const [mode, setMode] = useState("Loading..."); 
    const pointsRef = useRef([[]]); 
    const [colorIndex, setColorIndex] = useState(0);
    const { t } = useLanguage();

    // TEST STATE
    const [testActive, setTestActive] = useState(false);
    const [score, setScore] = useState(null);
    const [testTime, setTestTime] = useState(0);
    const testTimerRef = useRef(null);
    
    // Target Shape (Circle centered at 640/2, 480/2 with radius 100)
    // We define it functionally for verification
    const TARGET_CENTER = { x: 320, y: 240 };
    const TARGET_RADIUS = 100;

    const colors = [
        "#209fb5", // Sapphire
        "#e64553", // Maroon
        "#40a02b", // Green
        "#df8e1d", // Yellow
    ];

    const cycleColor = useCallback(() => {
         setColorIndex((prev) => {
             const next = (prev + 1) % colors.length;
             setColor(colors[next]);
             return next;
         });
         pointsRef.current.push([]);
    }, []);

    const clearCanvas = useCallback(() => {
        pointsRef.current = [[]];
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (testActive) {
           // If clearing during test, maybe reset score or something? 
           // For now, let's just let them clear and redraw.
        }
    }, [testActive]);

    const startTest = () => {
        clearCanvas();
        setTestActive(true);
        setScore(null);
        setTestTime(0);
        testTimerRef.current = setInterval(() => {
            setTestTime(prev => prev + 1);
        }, 1000);
    };

    const stopTest = () => {
        setTestActive(false);
        if (testTimerRef.current) clearInterval(testTimerRef.current);
        calculateScore();
    };

    const calculateScore = () => {
        // Collect all user points
        let allPoints = [];
        pointsRef.current.forEach(stroke => {
            allPoints = [...allPoints, ...stroke];
        });

        if (allPoints.length < 50) {
            setScore({ value: 0, text: "Not enough data. Please trace the circle." });
            return;
        }

        let totalDeviation = 0;
        let pointsCount = 0;

        allPoints.forEach(p => {
             // Distance from center
             const dist = Math.sqrt(Math.pow(p.x - TARGET_CENTER.x, 2) + Math.pow(p.y - TARGET_CENTER.y, 2));
             // Deviation from target radius
             const deviation = Math.abs(dist - TARGET_RADIUS);
             totalDeviation += deviation;
             pointsCount++;
        });

        const avgDeviation = totalDeviation / pointsCount;
        
        // Scoring logic (Arbitrary scaling)
        // 0 deviation = 100 score
        // 50 deviation = 0 score
        let calculatedScore = Math.max(0, 100 - (avgDeviation * 2)); // Strictness factor
        
        let feedback = "";
        if (calculatedScore > 85) feedback = "Excellent coordination!";
        else if (calculatedScore > 65) feedback = "Good motor control.";
        else feedback = "Some deviation detected.";

        setScore({ value: Math.round(calculatedScore), text: feedback });
    };

    const onResults = useCallback((results) => {
        if (!webcamRef.current || !canvasRef.current || !webcamRef.current.video) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // 0. Draw Guide Shape (If Test Active)
        if (testActive) {
            ctx.beginPath();
            ctx.arc(TARGET_CENTER.x, TARGET_CENTER.y, TARGET_RADIUS, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(114, 135, 253, 0.4)"; // Faint Lavender
            ctx.lineWidth = 10;
            ctx.setLineDash([20, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Text Instruction
            ctx.fillStyle = "rgba(76, 79, 105, 0.5)"; // Text color
            ctx.font = "20px Arial";
            ctx.fillText("Trace the Circle", TARGET_CENTER.x - 70, TARGET_CENTER.y - 10);
        }

        // 1. Draw existing strokes
        for(let i=0; i<pointsRef.current.length; i++) {
             const stroke = pointsRef.current[i];
             if(stroke.length < 2) continue;
             
             if (stroke[0] && stroke[0].color) {
                 ctx.strokeStyle = stroke[0].color;
             } else {
                 ctx.strokeStyle = color;
             }

             ctx.lineWidth = 8;
             ctx.lineCap = 'round';
             ctx.lineJoin = 'round';
             ctx.beginPath();
             ctx.moveTo(stroke[0].x, stroke[0].y);
             for(let j=1; j<stroke.length; j++) {
                 ctx.lineTo(stroke[j].x, stroke[j].y);
             }
             ctx.stroke();
        }

        // 2. Draw Hand Landmarks
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#ccd0da', lineWidth: 2}); 
                drawLandmarks(ctx, landmarks, {color: '#7287fd', lineWidth: 1, radius: 3});
                
                const indexTip = landmarks[8];
                const middleTip = landmarks[12];
                const ringTip = landmarks[16];
                const pinkyTip = landmarks[20];
                const thumbTip = landmarks[4];
                
                const isIndexUp = indexTip.y < landmarks[6].y;
                const isMiddleUp = middleTip.y < landmarks[10].y;
                const isRingUp = ringTip.y < landmarks[14].y;
                const isPinkyUp = pinkyTip.y < landmarks[18].y;

                if (isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
                    setMode("✍️ Drawing");
                    
                    const x = (1 - indexTip.x) * videoWidth;
                    const y = indexTip.y * videoHeight;
                    
                    const currentStrokeIndex = pointsRef.current.length - 1;
                    if (currentStrokeIndex >= 0) {
                         const currentStroke = pointsRef.current[currentStrokeIndex];
                         if(currentStroke.length === 0) {
                             currentStroke.push({x, y, color: color}); 
                         } else {
                             currentStroke.push({x, y});
                         }
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.fill();

                } else if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
                     setMode("✊ Clearing");
                     clearCanvas();
                } else if (isIndexUp && isMiddleUp) {
                    setMode("👆 Hovering");
                     if (pointsRef.current[pointsRef.current.length - 1].length > 0) {
                        pointsRef.current.push([]);
                    }
                    const x = (1 - indexTip.x) * videoWidth;
                    const y = indexTip.y * videoHeight;
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, 2 * Math.PI);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    setMode("...");
                    if (pointsRef.current[pointsRef.current.length - 1].length > 0) {
                        pointsRef.current.push([]);
                    }
                }
            }
        }
        ctx.restore();
    }, [color, clearCanvas, testActive]);

    useEffect(() => {
        const hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);

        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                   if (webcamRef.current && webcamRef.current.video) {
                       await hands.send({image: webcamRef.current.video});
                   }
                },
                width: 640, 
                height: 480
            });
            camera.start();
        }
        
        return () => {
            hands.close();
        };
    }, [onResults]);

  return (
    <div className="flex flex-col xl:flex-row items-start justify-center gap-8 mx-auto mt-4 w-fit xl:w-full max-w-7xl">
        <div className="relative">
            {/* Status Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 glass px-6 py-2 rounded-full flex items-center gap-4 border border-white/20 whitespace-nowrap">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-subtext0">{t('mode')}:</span>
                    <span className="text-base font-bold text-blue animate-pulse">{mode}</span>
                 </div>
                 
                 {!testActive && (
                     <>
                        <div className="w-px h-4 bg-surface2"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-subtext0">{t('color')}:</span>
                            <div className="w-6 h-6 rounded-full border border-white/20 shadow-inner" style={{backgroundColor: color}}></div>
                            <button onClick={cycleColor} className="text-xs text-subtext1 hover:text-text underline">{t('cycle')}</button>
                        </div>
                    </>
                 )}
            </div>

            <div className="glass-card p-2 rounded-[2rem] shadow-2xl relative">
                <Webcam
                    ref={webcamRef}
                    mirrored={true}
                    className="rounded-[1.5rem]"
                    style={{
                        width: 640,
                        height: 480,
                    }}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-2 left-2 rounded-[1.5rem] pointer-events-none"
                    style={{
                        width: 640,
                        height: 480,
                    }}
                />
            </div>
            
            <div className="mt-6 flex justify-center gap-8 text-subtext0 text-sm">
                 <div className="flex items-center gap-2">
                     <span className="text-2xl">☝️</span>
                     <span>{t('indexDraw')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-2xl">✊</span>
                     <span>{t('fistClear')}</span>
                 </div>
            </div>
        </div>

        {/* Test Controls / Sidebar */}
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-6 w-full xl:w-[320px] h-fit sticky top-8">
             <div>
                <h3 className="font-bold text-2xl text-text border-b border-surface2 pb-4 mb-2">{t('traceTestTitle')}</h3>
                <p className="text-subtext0 text-sm leading-relaxed">
                    {t('traceTestDesc')}
                </p>
             </div>
             
             {!testActive && !score && (
                 <div className="bg-surface0/50 rounded-xl p-4 border border-surface2">
                    <div className="flex items-center gap-3 text-subtext1 mb-4">
                        <span className="text-2xl">⏱️</span>
                        <span className="text-sm">{t('measureSpeed')}</span>
                    </div>
                    <button onClick={startTest} className="glass-button w-full py-4 rounded-xl text-lg font-bold bg-green/10 text-green border-green/30 hover:bg-green/20 hover:scale-105 transition-all">
                        {t('startTest')}
                    </button>
                 </div>
             )}

             {testActive && (
                 <div className="bg-surface0/50 rounded-xl p-6 border border-surface2 flex flex-col items-center gap-6">
                    <div className="text-center">
                        <div className="text-xs uppercase text-subtext0 font-bold tracking-wider mb-1">{t('elapsedTime')}</div>
                        <div className="text-5xl font-mono text-blue font-light">{testTime}s</div>
                    </div>
                    <div className="w-full h-px bg-surface2"></div>
                    <button onClick={stopTest} className="glass-button w-full py-4 rounded-xl text-lg font-bold bg-red/10 text-red border-red/30 hover:bg-red/20 animate-pulse">
                        {t('finishScore')}
                    </button>
                </div>
             )}

             {score && (
                 <div className="bg-surface0/50 rounded-xl p-6 border border-surface2 text-center animate-fade-in-up">
                    <div className="text-xs uppercase text-subtext0 font-bold mb-2 tracking-wider">{t('accuracyScore')}</div>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mauve to-blue mb-4">
                        {score.value}%
                    </div>
                    <div className="glass p-3 rounded-lg border border-white/50 mb-6">
                        <span className="text-text font-medium">{score.text}</span>
                    </div>
                    <button onClick={startTest} className="text-sm font-semibold text-blue hover:text-sky underline underline-offset-4">
                        {t('retakeTest')}
                    </button>
                 </div>
             )}
        </div>
    </div>
  );
};

export default AirCanvas;
