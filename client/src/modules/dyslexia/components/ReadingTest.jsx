import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export default function ReadingTest() {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [targetText, setTargetText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const texts = t('sampleText');
    if (Array.isArray(texts)) {
        setTargetText(texts[Math.floor(Math.random() * texts.length)]);
    } else {
        setTargetText(texts);
    }
  }, [language]);

  const refreshText = () => {
    const texts = t('sampleText');
    if (Array.isArray(texts)) {
       let newText = targetText;
       // Try to pick a different one
       while (newText === targetText && texts.length > 1) {
           newText = texts[Math.floor(Math.random() * texts.length)];
       }
       setTargetText(newText);
       // Reset states
       setTranscript('');
       setResult(null);
       setIsListening(false);
       setErrorMsg('');
       if (recognitionRef.current) recognitionRef.current.abort(); // Hard stop
    }
  };

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ml' ? 'ml-IN' : 'en-US';
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
           setErrorMsg('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'network') {
           setErrorMsg('Network error: Browser speech recognition requires an active internet connection. Please check your connection.');
        } else if (event.error === 'no-speech') {
           // Ignore no-speech, it might just be a pause
           return; 
        } else {
           setErrorMsg(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      return () => {
          if (recognitionRef.current) {
              recognitionRef.current.stop();
          }
      }
    } else {
        setErrorMsg('Browser does not support Speech Recognition.');
    }
  }, [language]);

  const toggleListening = () => {
      setErrorMsg('');
      if (isListening) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsListening(false);
          analyzeReading();
      } else {
          setTranscript('');
          setResult(null);
          setStartTime(Date.now());
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.error(e);
            setErrorMsg('Could not start microphone. Refresh and try again.');
          }
      }
  };

  const analyzeReading = async () => {
    const endTime = Date.now();
    const durationSeconds = (endTime - startTime) / 1000;
    const timeInMinutes = durationSeconds / 60;
    
    // Normalize texts: remove punctuation, lowercase
    const clean = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    
    // Simple word extraction suitable for EN and ML (by spaces)
    const targetWords = clean(targetText).split(/\s+/).filter(w => w.length > 0);
    const spokenWords = clean(transcript).split(/\s+/).filter(w => w.length > 0);
    
    let hitCount = 0;
    const missedWords = [];
    
    // Naive matching: check if target word exists in spoken words
    const spokenSet = new Set(spokenWords);
    
    targetWords.forEach(word => {
        if (spokenSet.has(word)) {
            hitCount++;
        } else {
            missedWords.push(word);
        }
    });

    const accuracy = Math.round((hitCount / targetWords.length) * 100) || 0;
    const wpm = timeInMinutes > 0 ? Math.round(spokenWords.length / timeInMinutes) : 0;

    // Send to Backend for Gemini Analysis
    try {
        const response = await fetch('/api/dyslexia/analyze_reading', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wpm,
                accuracy,
                missed_words: missedWords,
                total_words: targetWords.length,
                duration_seconds: durationSeconds,
                language: language,
                target_text_snippet: targetText
            })
        });
        
        if (response.ok) {
            const aiData = await response.json();
             setResult({
                accuracy,
                wpm,
                missedWords,
                aiAnalysis: aiData
            });
        } else {
             // Fallback if API fails
              setResult({
                accuracy,
                wpm,
                missedWords,
                aiAnalysis: null
            });
        }

    } catch (e) {
        console.error("AI Analysis Failed", e);
         setResult({
            accuracy,
            wpm,
            missedWords,
            aiAnalysis: null
        });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 border border-white/20 shadow-xl max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mauve to-blue mb-4">
                {t('readingTestTitle')}
            </h3>
            <p className="text-subtext0 max-w-2xl mx-auto">{t('readingTestDesc')}</p>
        </div>
        
        <div className="relative group mb-10">
            <div className="p-8 bg-surface0/50 rounded-2xl border border-surface2 shadow-inner">
                <p className="text-2xl font-medium leading-loose text-text text-center font-serif text-opacity-90">
                    {targetText}
                </p>
            </div>
             <button 
                onClick={refreshText}
                className="absolute top-4 right-4 p-2 bg-surface1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface2 text-subtext0 hover:text-text"
                title="Change Text"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>

        <div className="flex flex-col items-center gap-8">
            <button 
                onClick={toggleListening}
                className={`relative group flex items-center gap-4 px-10 py-5 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl overflow-hidden
                    ${isListening 
                        ? 'bg-red text-white ring-4 ring-red/20' 
                        : 'bg-gradient-to-r from-mauve to-blue text-white hover:shadow-mauve/50'}`}
            >
                {isListening ? (
                    <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        {t('stopReading')}
                    </>
                ) : (
                    <>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        {t('startReading')}
                    </>
                )}
            </button>

            {isListening && (
                <div className="w-full text-center animate-fade-in-up">
                    <p className="text-subtext1 mb-3 text-sm uppercase tracking-wider font-bold">{t('listening')}</p>
                    <div className="p-6 rounded-xl bg-surface0/80 min-h-[80px] text-text font-mono text-lg max-w-2xl mx-auto border border-mauve/20 shadow-sm relative">
                        {transcript || <span className="text-overlay0 italic">Listening for speech...</span>}
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 bg-red/10 border border-red/20 rounded-xl text-red font-medium animate-fade-in-up">
                    {errorMsg}
                </div>
            )}

            {result && !isListening && (
                 <div className="w-full animate-fade-in-up mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center border-t-4 border-t-green">
                            <h4 className="text-subtext1 mb-2 font-medium uppercase tracking-wide text-xs">{t('accuracy')}</h4>
                            <div className="text-5xl font-black text-green">{result.accuracy}%</div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center border-t-4 border-t-blue">
                            <h4 className="text-subtext1 mb-2 font-medium uppercase tracking-wide text-xs">{t('wpm')}</h4>
                            <div className="text-5xl font-black text-blue">{result.wpm}</div>
                        </div>
                         <div className="glass-card p-6 rounded-2xl border-t-4 border-t-red md:col-span-1">
                            <h4 className="text-subtext1 mb-4 font-medium uppercase tracking-wide text-xs text-center">{t('missedWords')}</h4>
                            {result.missedWords.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center max-h-[100px] overflow-y-auto custom-scrollbar">
                                    {result.missedWords.map((word, i) => (
                                        <span key={i} className="px-2 py-1 bg-red/10 text-red rounded text-xs font-medium">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-green">
                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-bold">Perfect Reading!</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {result.aiAnalysis && (
                        <div className="mt-8 p-6 bg-surface0/40 rounded-2xl border border-mauve/20">
                            <h4 className="text-xl font-bold text-mauve mb-4 flex items-center gap-2">
                                <span className="text-2xl">🤖</span> AI Assessment
                            </h4>
                            <div className="bg-white/50 p-4 rounded-xl mb-4">
                                <p className="text-text italic">{result.aiAnalysis.summary}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-bold text-subtext0 mb-2 text-sm uppercase">Detected Patterns</h5>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {result.aiAnalysis.detected_issues.map((issue, i) => (
                                            <li key={i} className="text-red">{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-subtext0 mb-2 text-sm uppercase">Recommendations</h5>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {result.aiAnalysis.recommendations.map((rec, i) => (
                                            <li key={i} className="text-green">{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
            )}
        </div>
    </div>
  );
}
