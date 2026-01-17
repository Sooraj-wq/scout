const API_BASE = '/api/dyscalculia';

// Helper functions for task logging
export const logTaskStart = (taskData) => {
  console.debug('Task started:', taskData);
  // Could log to backend if needed
};

export const logTaskAnswer = (answerData) => {
  // This is an alias for logTaskAttempt for backward compatibility
  logTaskAttempt(answerData);
};

export const logEvent = (eventData) => {
  console.debug('Event logged:', eventData);
  // Generic event logging - could extend to log different event types
};

export const logTaskAttempt = async (attemptData) => {
  try {
    const { sessionId, ...attemptWithoutSession } = attemptData;
    console.log('logTaskAttempt - sessionId:', sessionId, 'attemptData:', attemptData);
    
    if (!sessionId) {
      console.error('Session ID is missing in attemptData:', attemptData);
      return;
    }
    
    const url = `${API_BASE}/sessions/${sessionId}/attempts`;
    console.log('Posting to URL:', url);
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attemptWithoutSession)
    });
  } catch (error) {
    console.debug('Task attempt logging failed:', error);
  }
};

export const logExposure = async (exposureData) => {
  try {
    const { sessionId, ...exposureWithoutSession } = exposureData;
    await fetch(`${API_BASE}/sessions/${sessionId}/exposures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exposureWithoutSession)
    });
  } catch (error) {
    console.debug('Exposure logging failed:', error);
  }
};

export const logStressIndicator = async (stressData) => {
  try {
    const { sessionId, ...stressWithoutSession } = stressData;
    await fetch(`${API_BASE}/sessions/${sessionId}/stress-indicators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stressWithoutSession)
    });
  } catch (error) {
    console.debug('Stress indicator logging failed:', error);
  }
};

export const logPhaseChange = (phaseData) => {
  // logPhaseChange is now just for local logging, not API calls
  console.debug('Phase changed:', phaseData);
};

export const logSessionEnd = (sessionData) => {
  // Session end is handled by completeSession
  console.debug('Session ended:', sessionData);
};

export const getSessionData = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.debug('Failed to fetch session data:', error);
  }
  return null;
};

export const analyzeSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.debug('Failed to analyze session:', error);
  }
  return null;
};

export const generateExplanation = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/explanation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.debug('Failed to generate explanation:', error);
  }
  return null;
};

export const getSessionScore = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/score`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.debug('Failed to get session score:', error);
  }
  return null;
};

/**
 * Get AI-powered analysis from backend
 * Backend handles all Groq and Google AI Studio API calls
 */
export const getAIAnalysis = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE}/ai-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get AI analysis');
  } catch (error) {
    console.error('Failed to get AI analysis from backend:', error);
    throw error;
  }
};

/**
 * Get adaptive flash duration from backend
 * Backend calculates duration based on performance (70% threshold)
 */
export const getFlashDuration = async (sessionId, difficulty) => {
  try {
    const response = await fetch(`${API_BASE}/flash-duration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, difficulty })
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get flash duration');
  } catch (error) {
    console.error('Failed to get flash duration from backend:', error);
    throw error;
  }
};
