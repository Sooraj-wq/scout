// ResultsScreen component - AI analysis display
import { useGameStore } from './state/gameState';
import { useState, useEffect } from 'react';
import { getAIAnalysis } from './utils/eventLogger';
import './ResultsScreen.css';

export const ResultsScreen = ({ onReset }) => {
  const { reset, sessionId, observationAttempts } = useGameStore();
  const [showJson, setShowJson] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    // Don't show anything until AI analysis is complete
    if (!sessionId || observationAttempts.length === 0) {
      setAnalysisError('No assessment data available');
      return;
    }

    // Get analysis from backend AI API
    const fetchAIAnalysis = async () => {
      setIsLoadingAnalysis(true);
      setAnalysisError(null);
      setAnalysisData(null);
      
      try {
        const analysis = await getAIAnalysis(sessionId);
        setAnalysisData({ api_analysis: analysis });
        setAnalysisError(null);
      } catch (error) {
        console.error('Failed to get AI analysis data:', error);
        setAnalysisError(error.message);
        setAnalysisData(null);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAIAnalysis();
  }, [sessionId, observationAttempts]);

  const handleReset = () => {
    reset();
    onReset && onReset();
  };

  const GET_SCORE_LABEL = (s) => {
    if (s >= 80) return 'Developing Well';
    if (s >= 60) return 'Growing Steady';
    if (s >= 40) return 'Needs Support';
    return 'Benefits from Help';
  };



  // Show loading state while waiting for AI analysis
  if (isLoadingAnalysis) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '32px',
        background: 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
        borderRadius: '28px',
        overflow: 'auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '400',
            color: 'var(--catppuccin-text)',
            marginBottom: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Analyzing Results...
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--catppuccin-subtext0)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Getting AI insights from your assessment
          </p>
        </div>
        
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid var(--catppuccin-surface0)',
          borderTop: '4px solid var(--catppuccin-blue)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }} />
        
        <p style={{
          fontSize: '14px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          This may take up to 5 seconds...
        </p>
      </div>
    );
  }

  // Show error state if AI analysis failed
  if (analysisError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100%',
        padding: '32px',
        background: 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
        borderRadius: '28px',
        overflow: 'auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '400',
            color: 'var(--catppuccin-red)',
            marginBottom: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Analysis Failed
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--catppuccin-subtext0)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Unable to get AI analysis
          </p>
        </div>

        <div style={{
          background: 'var(--catppuccin-surface0)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <p style={{
            fontSize: '16px',
            color: 'var(--catppuccin-red)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            {analysisError}
          </p>
          <p style={{
            fontSize: '14px',
            color: 'var(--catppuccin-subtext0)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center'
          }}>
            Please check your API key configuration and try again.
          </p>
        </div>

        <button
          onClick={handleReset}
          style={{
            padding: '16px 32px',
            borderRadius: '28px',
            border: '2px solid var(--catppuccin-blue)',
            background: 'transparent',
            color: 'var(--catppuccin-blue)',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Don't show results until AI analysis is complete
  if (!analysisData) {
    return null;
  }

  const aiAnalysis = analysisData.api_analysis;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100%',
      padding: '32px',
      background: 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
      borderRadius: '28px',
      overflow: 'auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '400',
          color: 'var(--catppuccin-text)',
          marginBottom: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          AI Analysis Complete!
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Here's what our AI discovered
        </p>
      </div>

      <div style={{
        background: 'var(--catppuccin-surface0)',
        borderRadius: '28px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '60px',
            background: aiAnalysis.score >= 80 ? 'var(--catppuccin-green)' : aiAnalysis.score >= 60 ? 'var(--catppuccin-yellow)' : 'var(--catppuccin-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{
              fontSize: '36px',
              fontWeight: '600',
              color: 'var(--catppuccin-base)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {aiAnalysis.score}
            </span>
            <span style={{
              fontSize: '12px',
              color: 'var(--catppuccin-base)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              out of 100
            </span>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '16px',
          borderRadius: '16px',
          background: aiAnalysis.score >= 80 ? 'rgba(166, 227, 161, 0.2)' : aiAnalysis.score >= 60 ? 'rgba(249, 226, 175, 0.2)' : 'rgba(243, 139, 168, 0.2)',
          border: `2px solid ${aiAnalysis.score >= 80 ? 'var(--catppuccin-green)' : aiAnalysis.score >= 60 ? 'var(--catppuccin-yellow)' : 'var(--catppuccin-red)'}`,
          marginBottom: '24px'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '500',
            color: aiAnalysis.score >= 80 ? 'var(--catppuccin-green)' : aiAnalysis.score >= 60 ? 'var(--catppuccin-yellow)' : 'var(--catppuccin-red)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {GET_SCORE_LABEL(aiAnalysis.score)}
          </span>
        </div>

        <div style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'var(--catppuccin-text)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'pre-wrap',
          marginBottom: '16px'
        }}>
          {aiAnalysis.interpretation}
        </div>

        <div style={{
          fontSize: '14px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          Pattern: {aiAnalysis.pattern} (Confidence: {Math.round(aiAnalysis.confidence * 100)}%)
        </div>
      </div>

<div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: '16px 32px',
            borderRadius: '28px',
            border: '2px solid var(--catppuccin-blue)',
            background: 'transparent',
            color: 'var(--catppuccin-blue)',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Play Again
        </button>
        <button
          onClick={() => setShowJson(!showJson)}
          style={{
            padding: '16px 32px',
            borderRadius: '28px',
            border: '2px solid var(--catppuccin-magenta)',
            background: 'transparent',
            color: 'var(--catppuccin-magenta)',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {showJson ? 'Hide' : 'View'} AI Analysis
        </button>
      </div>

{showJson && (
        <div style={{
          marginTop: '24px',
          width: '100%',
          maxWidth: '600px'
        }}>
          <div style={{
            background: 'var(--catppuccin-surface0)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: 'var(--catppuccin-text)',
              marginBottom: '16px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              AI Analysis Details
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {Object.entries(analysisData).map(([key, data]) => (
                <details key={key} style={{
                  background: 'var(--catppuccin-base)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer'
                }}>
                  <summary style={{
                    color: key === 'error' ? 'var(--catppuccin-red)' : 'var(--catppuccin-blue)',
                    fontWeight: '500',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    cursor: 'pointer'
                  }}>
                    {key === 'error' ? 'API ERROR' : key.replace(/_/g, ' ').toUpperCase()}
                  </summary>
                  <pre style={{
                    color: key === 'error' ? 'var(--catppuccin-red)' : 'var(--catppuccin-yellow)',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    marginTop: '12px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '32px',
        padding: '16px 24px',
        borderRadius: '16px',
        background: 'rgba(203, 166, 247, 0.1)',
        border: '2px solid var(--catppuccin-magenta)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          margin: 0
        }}>
          This is a playful screening tool, not a medical assessment. 
          If you have concerns, please consult a qualified professional.
        </p>
      </div>
    </div>
  );
};

export default ResultsScreen;
