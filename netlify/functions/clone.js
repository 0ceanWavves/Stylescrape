// Dedicated clone function for Netlify
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { URL } = require('url');

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

// Helper function to detect libraries from HTML
const detectLibraries = (html) => {
  const libraries = [];
  
  // Check for common libraries
  if (html.includes('jquery')) libraries.push('jQuery');
  if (html.includes('bootstrap')) libraries.push('Bootstrap');
  if (html.includes('react')) libraries.push('React');
  if (html.includes('angular')) libraries.push('Angular');
  if (html.includes('vue')) libraries.push('Vue.js');
  if (html.includes('font-awesome') || html.includes('fontawesome')) libraries.push('Font Awesome');
  if (html.includes('google-analytics') || html.includes('gtag')) libraries.push('Google Analytics');
  if (html.includes('tailwind')) libraries.push('Tailwind CSS');
  
  return libraries;
};

// Function to extract assets (CSS, JS, images) from HTML
const extractAssets = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const assets = {
    stylesheets: [],
    scripts: [],
    images: []
  };
  
  // Extract CSS
  $('link[rel="stylesheet"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        const fullUrl = new URL(href, baseUrl).href;
        assets.stylesheets.push(fullUrl);
      } catch (e) {
        logError(`Invalid CSS URL: ${href}`, e);
      }
    }
  });
  
  // Extract JS
  $('script').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
      try {
        const fullUrl = new URL(src, baseUrl).href;
        assets.scripts.push(fullUrl);
      } catch (e) {
        logError(`Invalid script URL: ${src}`, e);
      }
    }
  });
  
  // Extract images
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
      try {
        const fullUrl = new URL(src, baseUrl).href;
        assets.images.push(fullUrl);
      } catch (e) {
        logError(`Invalid image URL: ${src}`, e);
      }
    }
  });
  
  return assets;
};

// Clone a website - handles the actual website scraping
const cloneWebsite = async (url, options) => {
  const steps = [];
  const assets = { html: '', stylesheets: [], scripts: [], images: [] };
  const libraries = [];
  
  try {
    // Step 1: Fetch the main HTML
    steps.push(`Cloning started for ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StyleScrape/1.0'
      },
      timeout: 8000 // Netlify functions have time limits
    });
    
    const html = response.data;
    assets.html = html;
    steps.push('Downloaded index.html');
    
    // Step 2: Detect libraries
    steps.push('Analyzing for libraries and technologies...');
    const detectedLibraries = detectLibraries(html);
    libraries.push(...detectedLibraries);
    
    // Step 3: Extract assets if requested
    if (options.cloneAssets) {
      steps.push('Extracting asset URLs...');
      const extractedAssets = extractAssets(html, url);
      
      // Limited asset download to avoid timeouts (just keeping URLs is faster)
      assets.stylesheets = extractedAssets.stylesheets;
      assets.scripts = extractedAssets.scripts;
      assets.images = extractedAssets.images.slice(0, 5); // Limit to first 5 images to avoid timeout
      
      steps.push(`Found ${extractedAssets.stylesheets.length} CSS files`);
      steps.push(`Found ${extractedAssets.scripts.length} JavaScript files`);
      steps.push(`Found ${extractedAssets.images.length} images`);
    }
    
    // Step 4: Finalize
    steps.push('Processing completed');
    
    return {
      success: true,
      steps,
      libraries,
      assets
    };
    
  } catch (error) {
    logError(`Error cloning website: ${url}`, error);
    steps.push(`Error: ${error.message}`);
    
    return {
      success: false,
      steps,
      libraries,
      assets,
      error: error.message
    };
  }
};

exports.handler = async function(event, context) {
  // Log function invocation with context ID
  logInfo(`Function invoked with ID: ${context.awsRequestId || 'local'}`, {
    path: event.path,
    method: event.httpMethod
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
          details: 'Only POST requests are supported'
        })
      };
    }
    
    // Parse request body
    let requestBody;
    try {
      logInfo('Parsing request body');
      requestBody = JSON.parse(event.body);
    } catch (e) {
      logError('Failed to parse request body', e);
      return {
        statusCode: 400,
        headers: handleCors(),
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid request body',
          details: 'Request body must be valid JSON'
        })
      };
    }
    
    // Check for required URL parameter
    const { url, cloneAssets = true, extractLibraries = true } = requestBody;
    if (!url) {
      logInfo('Missing URL parameter in request');
      return {
        statusCode: 400,
        headers: handleCors(),
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing parameter',
          details: 'URL parameter is required'
        })
      };
    }
    
    logInfo(`Processing cloning request for URL: ${url}`, { cloneAssets, extractLibraries });
    
    // Perform the actual website cloning
    const result = await cloneWebsite(url, { cloneAssets, extractLibraries });
    
    if (!result.success) {
      return {
        statusCode: 500,
        headers: handleCors(),
        body: JSON.stringify({
          success: false,
          message: `Failed to clone website: ${result.error}`,
          steps: result.steps
        })
      };
    }
    
    logInfo('Cloning completed successfully', { 
      url,
      libraries: result.libraries, 
      stepCount: result.steps.length,
      assetCounts: {
        css: result.assets.stylesheets.length,
        js: result.assets.scripts.length,
        images: result.assets.images.length
      }
    });
    
    // Return successful response
    return {
      statusCode: 200,
      headers: handleCors(),
      body: JSON.stringify({
        success: true,
        message: `Website ${url} cloned successfully`,
        libraries: result.libraries,
        steps: result.steps,
        assets: {
          stylesheetCount: result.assets.stylesheets.length,
          scriptCount: result.assets.scripts.length,
          imageCount: result.assets.images.length
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
        details: error.message
      })
    };
  }
}; 