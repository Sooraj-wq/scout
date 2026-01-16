import { useState } from 'react';

const ResultsDisplay = ({ results, aiAnalysis }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8 py-12">
      <div className="bg-mantle rounded-3xl p-8 max-w-4xl w-full shadow-material-lg border border-surface0">
        <h2 className="text-4xl font-bold text-mauve mb-8 text-center">Your Neuro-Cognitive Profile</h2>
        
        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Focus Score */}
          <div className="bg-surface0 rounded-2xl p-6 border border-surface1">
            <h3 className="text-xl font-semibold text-lavender mb-4">Focus Stability</h3>
            <div className="space-y-3">
              <div>
                <p className="text-subtext1 text-sm">Reaction Time</p>
                <p className="text-2xl font-bold text-mauve">
                  {results.sart?.meanReactionTime?.toFixed(0) || 0}ms
                </p>
              </div>
              <div>
                <p className="text-subtext1 text-sm">Commission Errors</p>
                <p className="text-2xl font-bold text-peach">
                  {results.sart?.commissionErrors || 0}
                </p>
              </div>
              <div>
                <p className="text-subtext1 text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-green">
                  {results.sart?.accuracy?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Working Memory Score */}
          <div className="bg-surface0 rounded-2xl p-6 border border-surface1">
            <h3 className="text-xl font-semibold text-lavender mb-4">Working Memory</h3>
            <div className="space-y-3">
              <div>
                <p className="text-subtext1 text-sm">Accuracy</p>
                <p className="text-3xl font-bold text-mauve">
                  {results.workingMemory?.accuracy?.toFixed(1) || 0}%
                </p>
              </div>
              <div>
                <p className="text-subtext1 text-sm">Correct Responses</p>
                <p className="text-xl font-bold text-green">
                  {results.workingMemory?.correctResponses || 0} / {results.workingMemory?.totalTargets || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Motor Stability Score */}
          <div className="bg-surface0 rounded-2xl p-6 border border-surface1">
            <h3 className="text-xl font-semibold text-lavender mb-4">Motor Control</h3>
            <div className="space-y-3">
              <div>
                <p className="text-subtext1 text-sm">Rhythm Variance</p>
                <p className="text-2xl font-bold text-mauve">
                  {results.tapping?.variance?.toFixed(0) || 0}
                </p>
              </div>
              <div>
                <p className="text-subtext1 text-sm">Total Taps</p>
                <p className="text-xl font-bold text-peach">
                  {results.tapping?.totalTaps || 0}
                </p>
              </div>
              <div>
                <p className="text-subtext1 text-sm">Avg Interval</p>
                <p className="text-lg font-bold text-text">
                  {results.tapping?.meanInterval?.toFixed(0) || 0}ms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="bg-surface0 rounded-2xl p-8 border border-surface1">
            <h3 className="text-2xl font-semibold text-peach mb-4 flex items-center gap-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              AI Cognitive Analysis
            </h3>
            <div 
              className="prose prose-invert max-w-none text-text"
              dangerouslySetInnerHTML={{ __html: aiAnalysis }}
            />
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 bg-surface0 border border-yellow rounded-2xl p-4">
          <p className="text-yellow text-sm">
            <strong>⚠️ Important:</strong> This is an educational screening tool and not a medical diagnosis. 
            Consult a healthcare professional for proper evaluation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-mauve hover:bg-[#d4b4ff] text-base font-bold py-3 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg"
          >
            Take Test Again
          </button>
          <button
            onClick={() => window.print()}
            className="bg-surface0 hover:bg-surface1 text-text font-bold py-3 px-8 rounded-full transition-all duration-200 border border-surface1"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
