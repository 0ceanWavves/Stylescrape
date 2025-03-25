const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const app = express();

// Configure CORS more explicitly
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Add proper Content-Security-Policy headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' *; font-src 'self' data:;"
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  next();
});

app.use(express.json()); // Parse JSON request bodies

// Log all requests to help debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

// Path normalization middleware - handles both direct and nested API paths
app.use((req, res, next) => {
  // Remove /api prefix if it appears at the start of the path
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
    console.log('Normalized path:', req.url);
  }
  next();
});

// Mock cloning function for Netlify (without actual file system access)
// Handle both root paths and paths with prefixes
app.post('/clone', (req, res) => {
  const { url, cloneAssets, extractLibraries } = req.body || {};
  
  console.log(`Cloning request received for: ${url || 'unknown URL'}`);
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Missing URL parameter',
      details: 'Please provide a valid URL to clone'
    });
  }
  
  // Generate a simulated response
  setTimeout(() => {
    try {
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
      
      // Send successful response
      res.json({
        success: true,
        message: `Website ${url} cloned successfully (simulation)`,
        libraries: libraries,
        steps: steps
      });
    } catch (error) {
      console.error('Error in clone endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        details: error.message
      });
    }
  }, 2000);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'StyleScrape API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock API to get sites
app.get('/sites', (req, res) => {
  res.json({
    sites: [
      { name: 'example', url: 'https://example.com' }
    ]
  });
});

// Catch all route for SPA
app.get('/', (req, res) => {
  res.json({
    message: 'StyleScrape API - Netlify Serverless Function',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Export handler for serverless function
exports.handler = serverless(app); 