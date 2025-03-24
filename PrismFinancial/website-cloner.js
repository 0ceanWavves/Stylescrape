const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const url = require('url');

// Configuration
const targetWebsite = 'https://joincobalt.com';
const outputDir = path.join(__dirname, 'cloned-site');
const maxDepth = 2; // How many levels deep to crawl
const downloadAssets = true; // Download images, CSS, JS, etc.

// Track visited URLs to avoid duplicates
const visitedUrls = new Set();

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create directories for assets
const assetsDir = path.join(outputDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Main function to clone a URL
async function cloneUrl(pageUrl, depth = 0) {
  if (visitedUrls.has(pageUrl) || depth > maxDepth) {
    return;
  }
  
  visitedUrls.add(pageUrl);
  console.log(`Cloning: ${pageUrl} (depth: ${depth})`);
  
  try {
    // Fetch the page
    const html = await fetchUrl(pageUrl);
    
    // Parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Get the path for saving the file
    const parsedUrl = url.parse(pageUrl);
    let filePath = path.join(outputDir, parsedUrl.pathname || 'index.html');
    
    // Handle root path and ensure directory exists
    if (parsedUrl.pathname === '/' || !parsedUrl.pathname) {
      filePath = path.join(outputDir, 'index.html');
    } else {
      // Create directory structure
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // If the path doesn't include a file extension, assume it's a directory and add index.html
      if (!path.extname(filePath)) {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath, { recursive: true });
        }
        filePath = path.join(filePath, 'index.html');
      }
    }
    
    // Process assets if enabled
    if (downloadAssets) {
      // Handle CSS files
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      for (const link of cssLinks) {
        const cssUrl = new URL(link.href, pageUrl).href;
        if (cssUrl.startsWith(targetWebsite)) {
          const cssPath = await downloadAsset(cssUrl);
          link.href = path.relative(path.dirname(filePath), cssPath);
        }
      }
      
      // Handle JavaScript files
      const scripts = document.querySelectorAll('script[src]');
      for (const script of scripts) {
        if (script.src) {
          const scriptUrl = new URL(script.src, pageUrl).href;
          if (scriptUrl.startsWith(targetWebsite)) {
            const scriptPath = await downloadAsset(scriptUrl);
            script.src = path.relative(path.dirname(filePath), scriptPath);
          }
        }
      }
      
      // Handle images
      const images = document.querySelectorAll('img');
      for (const img of images) {
        if (img.src) {
          const imgUrl = new URL(img.src, pageUrl).href;
          if (imgUrl.startsWith(targetWebsite)) {
            const imgPath = await downloadAsset(imgUrl);
            img.src = path.relative(path.dirname(filePath), imgPath);
          }
        }
      }
    }
    
    // Save the HTML file
    fs.writeFileSync(filePath, dom.serialize());
    console.log(`Saved: ${filePath}`);
    
    // Find and queue all links to the same domain
    if (depth < maxDepth) {
      const links = document.querySelectorAll('a[href]');
      for (const link of links) {
        try {
          const linkUrl = new URL(link.href, pageUrl).href;
          // Only follow links to the same domain
          if (linkUrl.startsWith(targetWebsite) && !visitedUrls.has(linkUrl)) {
            // Queue this URL for processing
            await cloneUrl(linkUrl, depth + 1);
          }
        } catch (error) {
          console.error(`Error processing link ${link.href}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error cloning ${pageUrl}:`, error.message);
  }
}

// Function to download an asset (CSS, JS, images, etc.)
async function downloadAsset(assetUrl) {
  // Parse the URL to get the pathname
  const parsedUrl = url.parse(assetUrl);
  const assetPath = path.join(assetsDir, parsedUrl.pathname);
  
  // Create the directory structure
  const assetDir = path.dirname(assetPath);
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }
  
  // Download the asset if it doesn't exist
  if (!fs.existsSync(assetPath)) {
    try {
      const data = await fetchUrl(assetUrl);
      fs.writeFileSync(assetPath, data);
      console.log(`Downloaded asset: ${assetUrl}`);
    } catch (error) {
      console.error(`Error downloading asset ${assetUrl}:`, error.message);
    }
  }
  
  return assetPath;
}

// Function to fetch a URL and return its content
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const fetchModule = targetUrl.startsWith('https') ? https : http;
    
    fetchModule.get(targetUrl, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        fetchUrl(redirectUrl).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP Error: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const contentType = response.headers['content-type'] || '';
        
        // If it's a text-based file, return as string
        if (contentType.includes('text/') || contentType.includes('application/javascript') || contentType.includes('application/json')) {
          resolve(Buffer.concat(chunks).toString());
        } else {
          // For binary files, return the buffer
          resolve(Buffer.concat(chunks));
        }
      });
    }).on('error', reject);
  });
}

// Create a package.json file if it doesn't exist
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  const packageData = {
    "name": "website-cloner",
    "version": "1.0.0",
    "description": "A tool to clone websites",
    "main": "website-cloner.js",
    "scripts": {
      "start": "node website-cloner.js"
    },
    "dependencies": {
      "jsdom": "^20.0.0"
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));
  console.log("Created package.json");
}

// Start the cloning process
console.log(`Starting to clone ${targetWebsite} to ${outputDir}`);
console.log(`Max depth: ${maxDepth}, Download assets: ${downloadAssets}`);
cloneUrl(targetWebsite)
  .then(() => console.log('Website cloning completed!'))
  .catch(error => console.error('Error during cloning:', error));
