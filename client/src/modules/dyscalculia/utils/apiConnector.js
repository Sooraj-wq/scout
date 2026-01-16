// API connector for external analysis services
// Primary: Groq, Fallback: Google AI Studio

const API_CONFIG = {
  primary: {
    endpoint: import.meta.env?.VITE_GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions',
    key: import.meta.env?.VITE_GROQ_API_KEY,
    model: import.meta.env?.VITE_GROQ_MODEL || 'mixtral-8x7b-32768'
  },
  fallback: {
    endpoint: import.meta.env?.VITE_GOOGLE_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    key: import.meta.env?.VITE_GOOGLE_API_KEY,
    model: 'gemini-2.5-flash'
  }
};

/**
 * Formats session data for analysis prompt
 * @param {Object} sessionData - Raw session data
 * @returns {string} Formatted analysis prompt
 */
const formatAnalysisPrompt = (sessionData) => {
  const attempts = sessionData.attempts || [];
  const summary = {
    totalAttempts: attempts.length,
    correct: attempts.filter(a => a.correct).length,
    incorrect: attempts.filter(a => !a.correct).length,
    avgLatency: attempts.reduce((sum, a) => sum + (a.latency || 0), 0) / attempts.length || 0,
    byTaskType: attempts.reduce((acc, a) => {
      acc[a.task_type] = acc[a.task_type] || { correct: 0, total: 0 };
      acc[a.task_type].total++;
      if (a.correct) acc[a.task_type].correct++;
      return acc;
    }, {})
  };

  return `Analyze this dyscalculia assessment session data and provide a structured analysis:

SESSION SUMMARY:
- Total attempts: ${summary.totalAttempts}
- Correct answers: ${summary.correct}
- Incorrect answers: ${summary.incorrect}
- Average response time: ${Math.round(summary.avgLatency)}ms

TASK PERFORMANCE:
${Object.entries(summary.byTaskType).map(([type, data]) =>
  `- ${type}: ${data.correct}/${data.total} correct (${Math.round(data.correct/data.total*100)}%)`
).join('\n')}

RAW DATA:
${JSON.stringify(sessionData, null, 2)}

Based on this data, provide an analysis in the following JSON format:
{
  "pattern": "exposure_related" | "possible_dyscalculia_signal" | "unclear",
  "confidence": 0.0-1.0,
  "score": 0-100,
  "sub_scores": {
    "quantity": 0-100,
    "comparison": 0-100,
    "symbol": 0-100,
    "improvement": 0.0-1.0
  },
  "reasoning": "brief explanation of the analysis",
  "interpretation": "user-friendly interpretation"
}

Return ONLY the JSON object, no additional text.`;
};

/**
 * Calls external API for analysis with primary key, falls back to secondary key
 * @param {Object} sessionData - The complete session data to analyze
 * @returns {Promise<Object>} Analysis result with pattern, confidence, score, etc.
 */
export const callAnalysisAPI = async (sessionData) => {
  const API_TIMEOUT = 5000; // 5 seconds timeout
  const attemptGroqCall = async (config) => {
    const prompt = formatAnalysisPrompt(sessionData);

    console.log('API Connector: Making Groq API call with prompt length:', prompt.length);

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Groq API timeout after 5 seconds')), API_TIMEOUT);
    });

    // Create fetch promise
    const fetchPromise = fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational psychologist analyzing learning assessment data. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    console.log('API Connector: Groq response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Connector: Groq API error response:', errorText);
      throw new Error(`Groq API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error('API Connector: Invalid Groq response structure:', result);
      throw new Error('Invalid Groq response structure');
    }

    console.log('API Connector: Groq raw response content:', content.substring(0, 200) + '...');

    // Parse the JSON response
    try {
      const analysis = JSON.parse(content.trim());
      console.log('API Connector: Successfully parsed Groq analysis:', analysis);
      return analysis;
    } catch (parseError) {
      console.error('API Connector: Failed to parse Groq response:', content);
      console.error('API Connector: Parse error:', parseError);
      throw new Error('Invalid JSON in Groq response');
    }
  };

  const attemptGoogleCall = async (config) => {
    const prompt = formatAnalysisPrompt(sessionData);

    console.log('API Connector: Making Google AI API call with prompt length:', prompt.length);
    const url = `${config.endpoint}?key=${config.key}`;

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Google AI API timeout after 5 seconds')), API_TIMEOUT);
    });

    // Create fetch promise
    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    console.log('API Connector: Google AI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Connector: Google AI API error response:', errorText);
      throw new Error(`Google AI API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('API Connector: Invalid Google AI response structure:', result);
      throw new Error('Invalid Google AI response structure');
    }

    console.log('API Connector: Google AI raw response content:', content.substring(0, 200) + '...');

    // Parse the JSON response
    try {
      const analysis = JSON.parse(content.trim());
      console.log('API Connector: Successfully parsed Google AI analysis:', analysis);
      return analysis;
    } catch (parseError) {
      console.error('API Connector: Failed to parse Google AI response:', content);
      console.error('API Connector: Parse error:', parseError);
      throw new Error('Invalid JSON in Google AI response');
    }
  };

  const attemptAPICall = async (serviceType, config, keyType) => {
    try {
      let result;
      if (serviceType === 'groq') {
        result = await attemptGroqCall(config);
      } else if (serviceType === 'google') {
        result = await attemptGoogleCall(config);
      } else {
        throw new Error(`Unknown service type: ${serviceType}`);
      }

      console.log(`${keyType} API call successful`);

      // Validate expected response structure
      if (!result.pattern || typeof result.confidence !== 'number' || typeof result.score !== 'number') {
        throw new Error('Invalid API response structure - missing required fields');
      }

      return result;
    } catch (error) {
      console.warn(`${keyType} API call failed:`, error.message);
      throw error;
    }
  };

  // Check if APIs are configured
  const groqConfigured = API_CONFIG.primary.key;
  const googleConfigured = API_CONFIG.fallback.key;

  if (!groqConfigured && !googleConfigured) {
    console.warn('API Connector: No API keys configured, using fallback analysis');
    throw new Error('No API keys configured');
  }

  // Try primary API (Groq) first
  if (groqConfigured) {
    try {
      console.log('API Connector: Attempting Groq API call');
      return await attemptAPICall('groq', API_CONFIG.primary, 'Primary (Groq)');
    } catch (error) {
      console.warn('Groq API failed:', error.message);
    }
  } else {
    console.log('API Connector: Groq not configured, skipping to Google');
  }

  // Try fallback API (Google AI Studio)
  if (googleConfigured) {
    try {
      console.log('API Connector: Attempting Google AI API call');
      return await attemptAPICall('google', API_CONFIG.fallback, 'Fallback (Google AI)');
    } catch (error) {
      console.warn('Google AI API failed:', error.message);
    }
  } else {
    console.log('API Connector: Google AI not configured');
  }

  console.error('API Connector: Both APIs failed or not configured');
  throw new Error('All API calls failed. Please check your API key configuration.');
};

/**
 * Gets analysis data for display, using API or fallback to local generation
 * @param {Object} sessionData - Session data to analyze
 * @returns {Promise<Object>} Analysis result object
 */
export const getAnalysisData = async (sessionData) => {
  console.log('API Connector: Starting analysis for session data:', {
    hasAttempts: !!(sessionData.attempts?.length),
    attemptsCount: sessionData.attempts?.length || 0,
    groqKeyConfigured: !!API_CONFIG.primary.key,
    googleKeyConfigured: !!API_CONFIG.fallback.key
  });

  try {
    const result = await callAnalysisAPI(sessionData);
    console.log('API Connector: Successfully got AI analysis');
    return result;
  } catch (error) {
    console.error('API analysis failed:', error);
    // No fallback - throw error to be handled by UI
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

// Removed fallback analysis function - no mock data will be shown