import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AirCanvas from './components/AirCanvas';

const Dyspraxia = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-transparent p-8 font-sans text-text">
       <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
            <Link to="/" className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
            </Link>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mauve to-blue">
                Dyspraxia & Motor Coordination
            </h1>
            </div>
        </div>

        {!isPlaying ? (
            <div className="max-w-4xl mx-auto mt-12 animate-fade-in-up">
                <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mauve via-pink to-blue"></div>
                    
                    <div className="w-24 h-24 bg-rosewater/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg className="w-12 h-12 text-rosewater" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                    </div>

                    <h2 className="text-4xl font-bold text-text mb-6">Air Canvas Assessment</h2>
                    <p className="text-xl text-subtext0 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Assess fine motor skills and spatial coordination by drawing in the air. 
                        We use AI to track your hand movements and analyze coordination patterns.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-mauve mb-3 font-semibold text-lg">👉 Point to Draw</div>
                            <p className="text-subtext1 text-sm">Raise your index finger to draw lines on the screen.</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-blue mb-3 font-semibold text-lg">✋ Palm to Hover</div>
                            <p className="text-subtext1 text-sm">Open your hand to move the cursor without drawing.</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-pink mb-3 font-semibold text-lg">✊ Fist to Clear</div>
                            <p className="text-subtext1 text-sm">Close your hand into a fist to clear the canvas.</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsPlaying(true)}
                        className="glass-button px-12 py-4 rounded-full text-xl font-bold group relative overflow-hidden"
                    >
                        <span className="relative z-10">Start Assessment</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-mauve to-blue opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>
                </div>
            </div>
        ) : (
            <div className="animate-fade-in-up">
                 <AirCanvas />
            </div>
        )}
       </div>
    </div>
  );
};

export default Dyspraxia;
