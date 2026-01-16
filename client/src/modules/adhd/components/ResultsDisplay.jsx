import { useState } from 'react';

const ResultsDisplay = ({ results, aiAnalysis }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8 py-12">
      <div className="glass-panel rounded-3xl p-10 max-w-5xl w-full">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mauve via-pink to-blue mb-10 text-center drop-shadow-sm">Your Neuro-Cognitive Profile</h2>
        
        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Focus Score */}
          <div className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-colors duration-300">
            <h3 className="text-xl font-bold text-lavender mb-6 border-b border-white/10 pb-2">Focus Stability</h3>
            <div className="space-y-4">
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Reaction Time</p>
                <p className="text-3xl font-black text-mauve drop-shadow-[0_0_10px_rgba(203,166,247,0.3)]">
                  {results.sart?.meanReactionTime?.toFixed(0) || 0}<span className="text-lg font-medium text-subtext1">ms</span>
                </p>
              </div>
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Commission Errors</p>
                <p className="text-3xl font-black text-peach drop-shadow-[0_0_10px_rgba(250,179,135,0.3)]">
                  {results.sart?.commissionErrors || 0}
                </p>
              </div>
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Accuracy</p>
                <p className="text-3xl font-black text-green drop-shadow-[0_0_10px_rgba(166,227,161,0.3)]">
                  {results.sart?.accuracy?.toFixed(1) || 0}<span className="text-lg font-medium text-subtext1">%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Working Memory Score */}
          <div className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-colors duration-300">
            <h3 className="text-xl font-bold text-lavender mb-6 border-b border-white/10 pb-2">Working Memory</h3>
            <div className="space-y-4">
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Accuracy</p>
                <p className="text-4xl font-black text-mauve drop-shadow-[0_0_10px_rgba(203,166,247,0.3)]">
                  {results.workingMemory?.accuracy?.toFixed(1) || 0}<span className="text-xl font-medium text-subtext1">%</span>
                </p>
              </div>
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Correct Responses</p>
                <p className="text-2xl font-bold text-green">
                  {results.workingMemory?.correctResponses || 0} <span className="text-subtext1 text-base font-normal">/ {results.workingMemory?.totalTargets || 0}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Motor Stability Score */}
          <div className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-colors duration-300">
            <h3 className="text-xl font-bold text-lavender mb-6 border-b border-white/10 pb-2">Motor Control</h3>
            <div className="space-y-4">
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Rhythm Variance</p>
                <p className="text-3xl font-black text-mauve drop-shadow-[0_0_10px_rgba(203,166,247,0.3)]">
                  {results.tapping?.variance?.toFixed(0) || 0}
                </p>
              </div>
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Total Taps</p>
                <p className="text-2xl font-bold text-peach">
                  {results.tapping?.totalTaps || 0}
                </p>
              </div>
              <div>
                <p className="text-subtext0 text-xs uppercase tracking-wider font-semibold">Avg Interval</p>
                <p className="text-xl font-bold text-text">
                  {results.tapping?.meanInterval?.toFixed(0) || 0}<span className="text-base font-normal text-subtext1">ms</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="glass rounded-2xl p-8 border border-peach/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-32 h-32 text-peach" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-peach mb-6 flex items-center gap-3 relative z-10">
              <span className="glass p-2 rounded-lg bg-peach/10 border border-peach/20">🤖</span>
              AI Cognitive Analysis
            </h3>
            <div 
              className="prose prose-invert max-w-none text-text leading-relaxed relative z-10"
              dangerouslySetInnerHTML={{ __html: aiAnalysis }}
            />
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 glass p-4 rounded-xl border-l-4 border-l-yellow flex gap-4 items-start">
          <div className="text-2xl">⚠️</div>
          <p className="text-yellow/90 text-sm font-medium pt-1">
            <strong>Important:</strong> This is an educational screening tool and not a medical diagnosis. 
            Consult a healthcare professional for proper evaluation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex gap-6 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="glass-button text-crust text-lg font-bold py-4 px-10 rounded-2xl hover:-translate-y-1 transform transition-all shadow-lg"
          >
            Take Test Again
          </button>
          <button
            onClick={() => window.print()}
            className="glass px-10 py-4 rounded-2xl text-text font-bold border border-white/10 hover:bg-white/5 transition-all hover:-translate-y-1"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
