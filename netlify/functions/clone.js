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

// New function to extract and lighten color palette
const extractColorPalette = (html) => {
  const $ = cheerio.load(html);
  const colorMap = {};
  const colorRegex = /#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+(?=-[0-9]{1,3})|slate-|gray-|zinc-|neutral-|stone-|red-|orange-|amber-|yellow-|lime-|green-|emerald-|teal-|cyan-|sky-|blue-|indigo-|violet-|purple-|fuchsia-|pink-|rose-/g;
  
  // Extract colors from style attributes
  $('[style]').each((i, el) => {
    const style = $(el).attr('style');
    const matches = style?.match(colorRegex) || [];
    matches.forEach(color => {
      colorMap[color] = (colorMap[color] || 0) + 1;
    });
  });
  
  // Extract from CSS classes that might contain color information
  $('[class]').each((i, el) => {
    const classes = $(el).attr('class');
    const colorClasses = classes?.split(' ').filter(cls => 
      cls.match(/bg-|text-|border-|shadow-|fill-|stroke-|from-|to-|via-/)
    ) || [];
    
    colorClasses.forEach(cls => {
      const colorMatches = cls.match(colorRegex);
      if (colorMatches) {
        colorMatches.forEach(color => {
          colorMap[color] = (colorMap[color] || 0) + 1;
        });
      }
    });
  });
  
  // Sort colors by frequency
  const sortedColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
    .slice(0, 10); // Take top 10 colors
  
  // Convert dark colors to lighter equivalents
  const lightenedPalette = sortedColors.map(color => {
    if (color.startsWith('#')) {
      // Simple lightening for hex colors
      return lightenHexColor(color);
    } else if (color.includes('slate-') || color.includes('gray-') || color.includes('zinc-') || 
               color.includes('neutral-') || color.includes('stone-')) {
      // Convert dark tailwind gray scales to lighter versions
      return lightenTailwindColor(color);
    }
    return color;
  });
  
  return {
    originalPalette: sortedColors,
    lightenedPalette: lightenedPalette
  };
};

// Helper to lighten hex colors
const lightenHexColor = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
  let g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
  let b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  
  // Check if it's a dark color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 128) {
    // Lighten dark colors
    r = Math.min(255, Math.floor(r * 1.7));
    g = Math.min(255, Math.floor(g * 1.7));
    b = Math.min(255, Math.floor(b * 1.7));
  }
  
  // Convert back to hex
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Helper to convert dark Tailwind colors to lighter versions
const lightenTailwindColor = (color) => {
  const parts = color.split('-');
  const colorName = parts[0];
  const shade = parseInt(parts[1]);
  
  if (shade >= 600) {
    // Convert dark shade to lighter one
    return `${colorName}-${Math.max(100, shade - 500)}`;
  }
  
  return color;
};

// Clone a website - handles the actual website scraping
const cloneWebsite = async (url, options) => {
  const steps = [];
  const assets = { html: '', stylesheets: [], scripts: [], images: [] };
  const libraries = [];
  let colorPalette = { originalPalette: [], lightenedPalette: [] };
  
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
    
    // Step 4: Extract and analyze color palette
    steps.push('Analyzing color palette...');
    colorPalette = extractColorPalette(html);
    steps.push(`Detected ${colorPalette.originalPalette.length} colors, created lighter alternatives`);
    
    // Step 5: Finalize
    steps.push('Processing completed');
    
    return {
      success: true,
      steps,
      libraries,
      assets,
      colorPalette
    };
    
  } catch (error) {
    logError(`Error cloning website: ${url}`, error);
    steps.push(`Error: ${error.message}`);
    
    return {
      success: false,
      steps,
      libraries,
      assets,
      colorPalette,
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
        },
        colorPalette: result.colorPalette
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