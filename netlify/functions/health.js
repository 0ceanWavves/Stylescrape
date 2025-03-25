// Simple health check function
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'StyleScrape API is running',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'unknown'
    })
  };
}; 