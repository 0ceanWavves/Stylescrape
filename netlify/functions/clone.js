// Dedicated clone function for Netlify
const cors = require('cors');

// Helper for CORS headers
const handleCors = (headers) => {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    ...headers
  };
};

// Enhanced logging helper
const logInfo = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[INFO] ${timestamp} - ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] ${timestamp} - ${message}`);
  if (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};

// Handle preflight requests
const handleOptions = () => {
  logInfo('Handling OPTIONS preflight request');
  return {
    statusCode: 204,
    headers: handleCors(),
    body: ''
  };
};

exports.handler = async function(event, context) {
  // Log function invocation with context ID
  logInfo(`Function invoked with ID: ${context.awsRequestId || 'local'}`, {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters
  });
  
  // Handle preflight CORS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }
  
  try {
    // Only allow POST method
    if (event.httpMethod !== 'POST') {
      logInfo(`Method not allowed: ${event.httpMethod}`);
      return {
        statusCode: 405,
        headers: handleCors(),
        body: JSON.stringify({ 
          success: false,
          error: 'Method not allowed',
          details: 'Only POST requests are supported',
          debug: {
            receivedMethod: event.httpMethod,
            timestamp: new Date().toISOString()
          }
        })
      };
    }
    
    // Parse request body
    let requestBody;
    try {
      logInfo('Parsing request body');
      requestBody = JSON.parse(event.body);
      logInfo('Request body parsed successfully', requestBody);
    } catch (e) {
      logError('Failed to parse request body', e);
      return {
        statusCode: 400,
        headers: handleCors(),
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid request body',
          details: 'Request body must be valid JSON',
          debug: {
            receivedBody: event.body,
            parsingError: e.message,
            timestamp: new Date().toISOString()
          }
        })
      };
    }
    
    // Check for required URL parameter
    const { url } = requestBody;
    if (!url) {
      logInfo('Missing URL parameter in request');
      return {
        statusCode: 400,
        headers: handleCors(),
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing parameter',
          details: 'URL parameter is required',
          debug: {
            receivedParams: Object.keys(requestBody),
            timestamp: new Date().toISOString()
          }
        })
      };
    }
    
    logInfo(`Processing cloning request for URL: ${url}`, requestBody);
    
    // Simulate cloning process with a mocked response
    const libraries = [];
    
    // Add libraries based on URL to simulate detection
    const urlLower = url.toLowerCase();
    if (urlLower.includes('react')) libraries.push('React');
    if (urlLower.includes('bootstrap') || Math.random() > 0.7) libraries.push('Bootstrap');
    if (Math.random() > 0.6) libraries.push('jQuery');
    if (Math.random() > 0.8) libraries.push('Font Awesome');
    if (Math.random() > 0.7) libraries.push('Google Analytics');
    
    // Create a log of "downloaded" files
    const steps = [
      `Cloning started for ${url}`,
      'Downloaded index.html',
      'Processing links...',
      'Downloaded style.css',
      'Downloaded main.js',
      'Downloaded image1.png',
      'Downloaded image2.jpg',
      'Updating local references...',
      'Cloning completed'
    ];
    
    logInfo('Cloning simulation completed successfully', { 
      libraries, 
      stepCount: steps.length 
    });
    
    // Return successful response
    return {
      statusCode: 200,
      headers: handleCors(),
      body: JSON.stringify({
        success: true,
        message: `Website ${url} cloned successfully (simulation)`,
        libraries: libraries,
        steps: steps,
        debug: {
          functionId: context.awsRequestId || 'local',
          processingTime: `${new Date().getTime() - new Date(event.requestContext?.timeEpoch || Date.now()).getTime()}ms`,
          timestamp: new Date().toISOString()
        }
      })
    };
    
  } catch (error) {
    logError('Unexpected error in function', error);
    
    // Return error response with detailed debugging info
    return {
      statusCode: 500,
      headers: handleCors(),
      body: JSON.stringify({
        success: false,
        error: 'Server error',
        details: error.message,
        debug: {
          functionId: context.awsRequestId || 'local',
          errorName: error.name,
          errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      })
    };
  }
}; 