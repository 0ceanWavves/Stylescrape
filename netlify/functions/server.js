// Simple redirect function that forwards to the dedicated functions
exports.handler = async function(event, context) {
  // Determine which function to invoke based on the path
  const path = event.path;
  let targetFunction = 'clone';
  
  if (path.includes('/health')) {
    targetFunction = 'health';
  } else if (path.includes('/log-error')) {
    targetFunction = 'log-error';
  }
  
  // Return a redirect response
  return {
    statusCode: 302,
    headers: {
      'Location': `/.netlify/functions/${targetFunction}`,
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({
      message: `Redirecting to ${targetFunction} function`,
      path: path
    })
  };
}; 