import { useGameStore } from './state/gameState';
import { useState, useEffect } from 'react';

export const ResultsScreen = ({ onReset }) => {
  const { score, explanation, reset, sessionId } = useGameStore();
  const [jsonData, setJsonData] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [mockData, setMockData] = useState(null);

  useEffect(() => {
    // Fetch actual data from backend
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/dyscalculia/sessions/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setJsonData(data);
        }
      } catch (error) {
        console.error('Failed to fetch session data:', error);
      }
    };

    // Generate mock data examples
    const generateMockData = () => {
      return {
        example1_exposure_related: {
          pattern: "exposure_related",
          confidence: 0.85,
          score: 72,
          sub_scores: {
            quantity: 68,
            comparison: 75,
            symbol: 55,
            improvement: 0.25
          },
          reasoning: "performance improved notably with practice; quantity recognition showed elevated error rates",
          interpretation: "Child needed time to become familiar but showed quick learning"
        },
        example2_possible_signal: {
          pattern: "possible_dyscalculia_signal",
          confidence: 0.78,
          score: 45,
          sub_scores: {
            quantity: 38,
            comparison: 42,
            symbol: 35,
            improvement: 0.05
          },
          reasoning: "symbol-based tasks were notably difficult; practice did not lead to noticeable improvement; quantity errors were consistent rather than variable",
          interpretation: "Consistent difficulties suggest need for additional visual support"
        },
        example3_mixed: {
          pattern: "unclear",
          confidence: 0.65,
          score: 58,
          sub_scores: {
            quantity: 55,
            comparison: 60,
            symbol: 48,
            improvement: 0.12
          },
          reasoning: "comparison tasks were frequently challenging; performance was generally stable across tasks",
          interpretation: "Mixed results - more exposure to numbers would help build confidence"
        }
      };
    };

    if (sessionId) {
      fetchSessionData();
    }
    setMockData(generateMockData());
  }, [sessionId]);

  const handleReset = () => {
    reset();
    onReset && onReset();
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Developing Well';
    if (s >= 60) return 'Growing Steady';
    if (s >= 40) return 'Needs Support';
    return 'Benefits from Help';
  };

  const briefSummary = score >= 60 
    ? 'Number skills developing through experience. Continued playful exposure will help.'
    : 'Some number concepts remain challenging. Additional visual and hands-on support may help.';

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
          Number Play Complete!
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--catppuccin-subtext0)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Here's what we observed
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
            background: score >= 80 ? 'var(--catppuccin-green)' : score >= 60 ? 'var(--catppuccin-yellow)' : 'var(--catppuccin-red)',
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
              {score}
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
          background: score >= 80 ? 'rgba(166, 227, 161, 0.2)' : score >= 60 ? 'rgba(249, 226, 175, 0.2)' : 'rgba(243, 139, 168, 0.2)',
          border: `2px solid ${score >= 80 ? 'var(--catppuccin-green)' : score >= 60 ? 'var(--catppuccin-yellow)' : 'var(--catppuccin-red)'}`,
          marginBottom: '24px'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '500',
            color: score >= 80 ? 'var(--catppuccin-green)' : score >= 60 ? 'var(--catppuccin-yellow)' : 'var(--catppuccin-red)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {getScoreLabel(score)}
          </span>
        </div>

        <div style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'var(--catppuccin-text)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'pre-wrap'
        }}>
          {explanation || briefSummary}
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
          {showJson ? 'Hide' : 'View'} JSON Data
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
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: 'var(--catppuccin-text)',
              marginBottom: '16px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Session Data (Actual)
            </h3>
            <pre style={{
              background: 'var(--catppuccin-base)',
              color: 'var(--catppuccin-green)',
              padding: '16px',
              borderRadius: '12px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: 'monospace',
              maxHeight: '300px'
            }}>
              {jsonData ? JSON.stringify(jsonData, null, 2) : 'Loading...'}
            </pre>
          </div>

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
              Mock Data Examples
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {mockData && Object.entries(mockData).map(([key, data]) => (
                <details key={key} style={{
                  background: 'var(--catppuccin-base)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer'
                }}>
                  <summary style={{
                    color: 'var(--catppuccin-blue)',
                    fontWeight: '500',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    cursor: 'pointer'
                  }}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </summary>
                  <pre style={{
                    color: 'var(--catppuccin-yellow)',
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
