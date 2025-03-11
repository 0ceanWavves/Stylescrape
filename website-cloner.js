const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const url = require('url');

// Configuration
const defaultWebsite = 'https://joincobalt.com';
const outputBaseDir = path.join(__dirname, 'cloned-sites');

// Website cloner class
class WebsiteCloner {
  constructor(targetWebsite, outputDir, options = {}) {
    this.targetWebsite = targetWebsite;
    this.outputDir = outputDir;
    this.maxDepth = options.maxDepth || 2;
    this.downloadAssets = options.downloadAssets !== false;
    this.assetsDir = path.join(this.outputDir, 'assets');
    this.visitedUrls = new Set();
    
    // Create output directories
    this.ensureDirectoryExists(this.outputDir);
    if (this.downloadAssets) {
      this.ensureDirectoryExists(this.assetsDir);
    }
    
    console.log(`Starting to clone ${this.targetWebsite} to ${this.outputDir}`);
    console.log(`Max depth: ${this.maxDepth}, Download assets: ${this.downloadAssets}`);
  }
  
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  async start() {
    try {
      await this.cloneUrl(this.targetWebsite);
      console.log('Website cloning completed!');
    } catch (error) {
      console.error('Error during cloning process:', error);
    }
  }
  
  async cloneUrl(pageUrl, depth = 0) {
    if (this.visitedUrls.has(pageUrl) || depth > this.maxDepth) {
      return;
    }
    
    this.visitedUrls.add(pageUrl);
    console.log(`Cloning: ${pageUrl} (depth: ${depth})`);
    
    try {
      // Fetch the page
      const html = await this.fetchUrl(pageUrl);
      
      // Parse the HTML
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Get the path for saving the file
      const parsedUrl = url.parse(pageUrl);
      let filePath = path.join(this.outputDir, parsedUrl.pathname || 'index.html');
      
      // Handle root path and ensure directory exists
      if (parsedUrl.pathname === '/' || !parsedUrl.pathname) {
        filePath = path.join(this.outputDir, 'index.html');
      } else {
        // Create directory structure
        const dirPath = path.dirname(filePath);
        this.ensureDirectoryExists(dirPath);
        
        // If the path doesn't include a file extension, assume it's a directory and add index.html
        if (!path.extname(filePath)) {
          this.ensureDirectoryExists(filePath);
          filePath = path.join(filePath, 'index.html');
        }
      }
      
      // Process assets if enabled
      if (this.downloadAssets) {
        await this.processAssets(document, pageUrl, filePath);
      }
      
      // Save the HTML file
      fs.writeFileSync(filePath, dom.serialize());
      console.log(`Saved: ${filePath}`);
      
      // Find and queue all links to the same domain
      if (depth < this.maxDepth) {
        await this.processLinks(document, pageUrl, depth);
      }
    } catch (error) {
      console.error(`Error cloning ${pageUrl}:`, error.message);
    }
  }
  
  async processAssets(document, baseUrl, htmlFilePath) {
    // Handle CSS files
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of cssLinks) {
      if (link.href) {
        try {
          const cssUrl = new URL(link.href, baseUrl).href;
          if (cssUrl.startsWith(this.targetWebsite)) {
            const cssPath = await this.downloadAsset(cssUrl);
            link.href = path.relative(path.dirname(htmlFilePath), cssPath);
          }
        } catch (e) {
          console.error(`Error processing CSS ${link.href}:`, e.message);
        }
      }
    }
    
    // Handle JavaScript files
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      if (script.src) {
        try {
          const scriptUrl = new URL(script.src, baseUrl).href;
          if (scriptUrl.startsWith(this.targetWebsite)) {
            const scriptPath = await this.downloadAsset(scriptUrl);
            script.src = path.relative(path.dirname(htmlFilePath), scriptPath);
          }
        } catch (e) {
          console.error(`Error processing script ${script.src}:`, e.message);
        }
      }
    }
    
    // Handle images
    const images = document.querySelectorAll('img');
    for (const img of images) {
      if (img.src) {
        try {
          const imgUrl = new URL(img.src, baseUrl).href;
          // Download both internal and external images
          const imgPath = await this.downloadAsset(imgUrl);
          img.src = path.relative(path.dirname(htmlFilePath), imgPath);
        } catch (e) {
          console.error(`Error processing image ${img.src}:`, e.message);
        }
      }
    }
  }
  
  async processLinks(document, baseUrl, depth) {
    const links = document.querySelectorAll('a[href]');
    const promises = [];
    
    for (const link of links) {
      try {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
          continue;
        }
        
        const linkUrl = new URL(href, baseUrl).href;
        
        // Only follow links to the same domain
        if (linkUrl.startsWith(this.targetWebsite) && !this.visitedUrls.has(linkUrl)) {
          promises.push(this.cloneUrl(linkUrl, depth + 1));
        }
      } catch (error) {
        console.error(`Error processing link ${link.href}:`, error.message);
      }
    }
    
    // Process links in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      await Promise.all(batch);
    }
  }
  
  async downloadAsset(assetUrl) {
    try {
      // Parse the URL to get the pathname
      const parsedUrl = url.parse(assetUrl);
      
      // Create a sanitized path for the asset
      let assetPath;
      
      if (parsedUrl.pathname) {
        // Remove leading slash and query parameters
        let pathWithoutQuery = parsedUrl.pathname.replace(/^\//, '');
        
        // Handle Next.js image routes specially
        if (pathWithoutQuery.startsWith('_next/image')) {
          // For Next.js image URLs, create a special filename with a hash
          const originalUrl = new URLSearchParams(parsedUrl.query || '').get('url');
          const urlHash = Buffer.from(assetUrl).toString('base64').substring(0, 10)
            .replace(/[\/\+\=]/g, '_');
          
          if (originalUrl) {
            // Extract filename from the original URL
            const originalFilename = path.basename(originalUrl);
            pathWithoutQuery = `next-images/${urlHash}-${originalFilename}`;
          } else {
            pathWithoutQuery = `next-images/${urlHash}.jpg`;
          }
        }
        
        assetPath = path.join(this.assetsDir, pathWithoutQuery);
      } else {
        // Fallback for unusual URLs
        const urlHash = Buffer.from(assetUrl).toString('base64').substring(0, 15)
          .replace(/[\/\+\=]/g, '_');
        assetPath = path.join(this.assetsDir, `asset-${urlHash}`);
      }
      
      // Create the directory structure
      const assetDir = path.dirname(assetPath);
      this.ensureDirectoryExists(assetDir);
      
      // Download the asset if it doesn't exist
      if (!fs.existsSync(assetPath)) {
        try {
          const data = await this.fetchUrl(assetUrl);
          fs.writeFileSync(assetPath, data);
          console.log(`Downloaded asset: ${assetUrl}`);
        } catch (error) {
          console.error(`Error downloading asset ${assetUrl}:`, error.message);
          return assetPath; // Return the path anyway so HTML doesn't break
        }
      }
      
      return assetPath;
    } catch (error) {
      console.error(`Error processing asset ${assetUrl}:`, error.message);
      return ''; // Return empty string on error
    }
  }
  
  fetchUrl(targetUrl) {
    return new Promise((resolve, reject) => {
      const fetchModule = targetUrl.startsWith('https') ? https : http;
      
      const request = fetchModule.get(targetUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          return this.fetchUrl(new URL(redirectUrl, targetUrl).href)
            .then(resolve)
            .catch(reject);
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
          if (contentType.includes('text/') || 
              contentType.includes('application/javascript') || 
              contentType.includes('application/json') || 
              contentType.includes('application/xml') ||
              contentType.includes('css')) {
            resolve(Buffer.concat(chunks).toString());
          } else {
            // For binary files, return the buffer
            resolve(Buffer.concat(chunks));
          }
        });
      });
      
      request.on('error', reject);
      
      // Set a timeout to avoid hanging
      request.setTimeout(15000, () => {
        request.destroy();
        reject(new Error(`Request timeout for ${targetUrl}`));
      });
    });
  }
}

// Allow command line arguments to override defaults
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    website: defaultWebsite,
    outputDir: null,
    maxDepth: 2,
    downloadAssets: true
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--url' && i + 1 < args.length) {
      options.website = args[++i];
    } else if (arg === '--output' && i + 1 < args.length) {
      options.outputDir = args[++i];
    } else if (arg === '--depth' && i + 1 < args.length) {
      options.maxDepth = parseInt(args[++i], 10);
    } else if (arg === '--no-assets') {
      options.downloadAssets = false;
    } else if (arg === '--help') {
      console.log(`
Website Cloner Tool

Usage:
  node website-cloner.js [options]

Options:
  --url [url]       URL of the website to clone (default: ${defaultWebsite})
  --output [dir]    Output directory name (default: website hostname)
  --depth [number]  Maximum depth to crawl (default: 2)
  --no-assets       Skip downloading assets (CSS, JS, images)
  --help            Show this help message
      `);
      process.exit(0);
    }
  }
  
  return options;
}

// Main execution
async function main() {
  const options = parseArguments();
  
  try {
    const websiteUrl = new URL(options.website);
    
    // Create an output directory based on the hostname if not specified
    const outputDir = options.outputDir 
      ? path.join(outputBaseDir, options.outputDir)
      : path.join(outputBaseDir, websiteUrl.hostname);
    
    const cloner = new WebsiteCloner(
      options.website, 
      outputDir, 
      { 
        maxDepth: options.maxDepth,
        downloadAssets: options.downloadAssets
      }
    );
    
    await cloner.start();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Please provide a valid URL (including http:// or https://)');
    process.exit(1);
  }
}

// Run the program
main();
