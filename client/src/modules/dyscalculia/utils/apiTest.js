// Quick test for API connectivity
// Run this in browser console to test API keys

const testGroqAPI = async () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const endpoint = import.meta.env.VITE_GROQ_ENDPOINT;

  console.log('Testing Groq API...');
  console.log('Key configured:', !!apiKey);
  console.log('Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    console.log('Response status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('Success:', result);
    } else {
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('Network error:', error);
  }
};

const testGoogleAPI = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const endpoint = import.meta.env.VITE_GOOGLE_ENDPOINT;

  console.log('Testing Google AI API...');
  console.log('Key configured:', !!apiKey);
  console.log('Endpoint:', endpoint);

  try {
    const url = `${endpoint}?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    });

    console.log('Response status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('Success:', result);
    } else {
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('Network error:', error);
  }
};

// Export for console testing
window.testAPIs = { testGroqAPI, testGoogleAPI };