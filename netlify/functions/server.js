const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { spawn } = require('child_process');
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

// Mock cloning function for Netlify (without actual file system access)
app.post('/api/clone', (req, res) => {
  const { url, cloneAssets, extractLibraries } = req.body;
  
  console.log(`Cloning request received for: ${url}`);
  
  // Generate a simulated response
  setTimeout(() => {
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
  }, 2000);
});

// Mock API to get sites
app.get('/api/sites', (req, res) => {
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
    status: 'running'
  });
});

// For local development
if (process.env.LOCAL) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export handler for serverless function
exports.handler = serverless(app); 