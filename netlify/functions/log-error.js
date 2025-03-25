// Function for capturing client-side errors
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

exports.handler = async function(event, context) {
  // Handle preflight CORS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: handleCors(),
      body: ''
    };
  }
  
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: handleCors(),
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    
    // Log the client error with contextual information
    console.error('CLIENT ERROR:', {
      timestamp: new Date().toISOString(),
      functionId: context.awsRequestId || 'local',
      clientInfo: {
        userAgent: event.headers['user-agent'] || 'Unknown',
        referer: event.headers['referer'] || 'Unknown',
        ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Unknown'
      },
      error: requestBody.error,
      message: requestBody.message,
      stack: requestBody.stack,
      componentStack: requestBody.componentStack,
      url: requestBody.url,
      location: requestBody.location,
      additionalInfo: requestBody.additionalInfo
    });
    
    // Return success response
    return {
      statusCode: 200,
      headers: handleCors(),
      body: JSON.stringify({
        success: true,
        message: 'Error logged successfully'
      })
    };
  } catch (error) {
    console.error('Error logging function failed:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: handleCors(),
      body: JSON.stringify({
        success: false,
        message: 'Failed to log error'
      })
    };
  }
}; 