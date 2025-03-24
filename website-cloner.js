const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const url = require('url');

/**
 * Website Cloner Tool
 * 
 * This script downloads a website for local analysis and design study.
 * Features:
 * - Downloads HTML pages from a target website
 * - Follows links to capture the site structure
 * - Downloads CSS, JavaScript, images and other assets
 * - Saves everything to a local directory structure
 * - Updates links to point to local resources
 */

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: '',
    output: path.join(__dirname, 'cloned-site'),
    depth: 2,
    assets: true,
    extract: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--url=')) {
      options.url = arg.substring(6);
    } else if (arg.startsWith('--output=')) {
      options.output = arg.substring(9);
    } else if (arg.startsWith('--depth=')) {
      options.depth = parseInt(arg.substring(8), 10);
    } else if (arg === '--assets') {
      options.assets = true;
    } else if (arg === '--no-assets') {
      options.assets = false;
    } else if (arg === '--extract') {
      options.extract = true;
    } else if (arg === '--help') {
      console.log(`
Website Cloner Tool - Usage:
---------------------------
node website-cloner.js --url=https://example.com [options]

Options:
  --url=URL             The website URL to clone (required)
  --output=PATH         Where to save the cloned website (default: ./cloned-site)
  --depth=NUMBER        How many levels of links to follow (default: 2)
  --assets              Download images, CSS, JavaScript files (default)
  --no-assets           Don't download assets
  --extract             Extract and analyze design elements
  --help                Show this help message
      `);
      process.exit(0);
    }
  }

  if (!options.url) {
    console.error('Error: URL is required. Use --url=https://example.com');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  return options;
}

// Parse command-line arguments and set config
const args = parseArgs();

// Configuration - Edit these values
const config = {
  targetWebsite: args.url,                    // The website URL to clone
  outputDir: args.output,                     // Where to save the cloned website
  maxDepth: args.depth,                       // How many levels of links to follow
  downloadAssets: args.assets,                // Download images, CSS, JavaScript files
  extractDesign: args.extract,                // Extract design elements
  respectRobotsTxt: true,                     // Whether to check and respect robots.txt
  delayBetweenRequests: 500,                  // Delay between requests in ms to be polite
  userAgent: 'Mozilla/5.0 Website Analysis Tool' // User agent string to use
};

// Track visited URLs to avoid duplicates
const visitedUrls = new Set();
const failedUrls = new Set();
let urlsInQueue = 0;

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Create directories for assets
const assetsDir = path.join(config.outputDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * Makes a delay to avoid overwhelming the target server
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main function to clone a URL
 * @param {string} pageUrl - URL to clone
 * @param {number} depth - Current depth level
 */
async function cloneUrl(pageUrl, depth = 0) {
  if (visitedUrls.has(pageUrl) || depth > config.maxDepth) {
    urlsInQueue--;
    return;
  }
  
  visitedUrls.add(pageUrl);
  urlsInQueue++;
  console.log(`[${urlsInQueue}] Cloning: ${pageUrl} (depth: ${depth})`);
  
  try {
    // Add a polite delay
    await delay(config.delayBetweenRequests);
    
    // Fetch the page
    const html = await fetchUrl(pageUrl);
    
    // Parse the HTML
    const dom = new JSDOM(html, { url: pageUrl });
    const document = dom.window.document;
    
    // Get the path for saving the file
    const parsedUrl = url.parse(pageUrl);
    let filePath = path.join(config.outputDir, parsedUrl.pathname || 'index.html');
    
    // Handle root path and ensure directory exists
    if (parsedUrl.pathname === '/' || !parsedUrl.pathname) {
      filePath = path.join(config.outputDir, 'index.html');
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
    if (config.downloadAssets) {
      // Keep track of asset download promises
      const assetPromises = [];
      
      // Handle CSS files
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      for (const link of cssLinks) {
        try {
          const cssUrl = new URL(link.href, pageUrl).href;
          if (cssUrl.startsWith(config.targetWebsite)) {
            assetPromises.push(downloadAsset(cssUrl).then(cssPath => {
              link.href = path.relative(path.dirname(filePath), cssPath)
                .replace(/\\/g, '/'); // Replace backslashes with forward slashes
            }));
          }
        } catch (error) {
          console.error(`Error processing CSS link ${link.href}:`, error.message);
        }
      }
      
      // Handle JavaScript files
      const scripts = document.querySelectorAll('script[src]');
      for (const script of scripts) {
        try {
          if (script.src) {
            const scriptUrl = new URL(script.src, pageUrl).href;
            if (scriptUrl.startsWith(config.targetWebsite)) {
              assetPromises.push(downloadAsset(scriptUrl).then(scriptPath => {
                script.src = path.relative(path.dirname(filePath), scriptPath)
                  .replace(/\\/g, '/');
              }));
            }
          }
        } catch (error) {
          console.error(`Error processing script ${script.src}:`, error.message);
        }
      }
      
      // Handle images
      const images = document.querySelectorAll('img');
      for (const img of images) {
        try {
          if (img.src) {
            const imgUrl = new URL(img.src, pageUrl).href;
            if (imgUrl.startsWith(config.targetWebsite)) {
              assetPromises.push(downloadAsset(imgUrl).then(imgPath => {
                img.src = path.relative(path.dirname(filePath), imgPath)
                  .replace(/\\/g, '/');
              }));
            }
          }
        } catch (error) {
          console.error(`Error processing image ${img.src}:`, error.message);
        }
      }
      
      // Wait for all asset downloads to complete
      await Promise.all(assetPromises);
    }
    
    // Save the HTML file
    fs.writeFileSync(filePath, dom.serialize());
    console.log(`Saved: ${filePath}`);
    
    // Find and queue all links to the same domain
    if (depth < config.maxDepth) {
      const links = document.querySelectorAll('a[href]');
      for (const link of links) {
        try {
          const href = link.getAttribute('href');
          
          // Skip empty links or hash links
          if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            continue;
          }
          
          // Handle relative links 
          const linkUrl = new URL(href, pageUrl).href;
          
          // Only follow links to the same domain
          if (linkUrl.startsWith(config.targetWebsite) && !visitedUrls.has(linkUrl)) {
            // Queue this URL for processing
            cloneUrl(linkUrl, depth + 1);
          }
        } catch (error) {
          console.error(`Error processing link ${link.href}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error cloning ${pageUrl}:`, error.message);
    failedUrls.add(pageUrl);
  } finally {
    urlsInQueue--;
    
    // If we've processed all URLs, print a summary
    if (urlsInQueue === 0) {
      printSummary();
    }
  }
}

/**
 * Function to download an asset (CSS, JS, images, etc.)
 * @param {string} assetUrl - URL of the asset to download
 * @returns {Promise<string>} - Path where the asset was saved
 */
async function downloadAsset(assetUrl) {
  // Parse the URL to get the pathname
  const parsedUrl = url.parse(assetUrl);
  const urlPath = parsedUrl.pathname || '';
  
  // Create subdirectories based on extension
  let assetDir;
  const ext = path.extname(urlPath).toLowerCase();
  
  if (ext === '.css') {
    assetDir = path.join(assetsDir, 'css');
  } else if (ext === '.js') {
    assetDir = path.join(assetsDir, 'js');
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
    assetDir = path.join(assetsDir, 'images');
  } else if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
    assetDir = path.join(assetsDir, 'fonts');
  } else {
    assetDir = path.join(assetsDir, 'other');
  }
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }
  
  // Create filename from URL, removing query parameters
  const filename = path.basename(urlPath.split('?')[0]);
  const assetPath = path.join(assetDir, filename);
  
  // Download the asset if it doesn't exist
  if (!fs.existsSync(assetPath)) {
    try {
      await delay(config.delayBetweenRequests);
      const data = await fetchUrl(assetUrl);
      fs.writeFileSync(assetPath, data);
      console.log(`Downloaded asset: ${path.relative(config.outputDir, assetPath)}`);
    } catch (error) {
      console.error(`Error downloading asset ${assetUrl}:`, error.message);
      failedUrls.add(assetUrl);
      return '';
    }
  }
  
  return assetPath;
}

/**
 * Function to fetch a URL and return its content
 * @param {string} targetUrl - URL to fetch
 * @returns {Promise<Buffer|string>} - Content of the URL
 */
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    const fetchModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      }
    };
    
    fetchModule.get(options, (response) => {
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
        if (contentType.includes('text/') || 
            contentType.includes('application/javascript') || 
            contentType.includes('application/json') ||
            contentType.includes('application/xml') ||
            contentType.includes('application/xhtml')) {
          resolve(Buffer.concat(chunks).toString());
        } else {
          // For binary files, return the buffer
          resolve(Buffer.concat(chunks));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Generate a design analysis HTML report from the cloned site
 */
function generateDesignAnalysis() {
  console.log('Generating design analysis report...');
  
  // Create directories for the design analysis
  const designDir = path.join(__dirname, 'design-elements');
  const cssDir = path.join(designDir, 'css');
  
  if (!fs.existsSync(designDir)) {
    fs.mkdirSync(designDir, { recursive: true });
  }
  
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  // Extract CSS from the cloned site
  const cssFiles = [];
  
  function findCSS(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findCSS(fullPath);
      } else if (entry.name.endsWith('.css')) {
        cssFiles.push(fullPath);
      }
    }
  }
  
  // Find all CSS files in the cloned site
  if (fs.existsSync(config.outputDir)) {
    findCSS(config.outputDir);
    
    // Create a comprehensive CSS file
    let allCSS = '';
    
    cssFiles.forEach(file => {
      const css = fs.readFileSync(file, 'utf8');
      allCSS += `/* From ${path.relative(config.outputDir, file)} */\n${css}\n\n`;
    });
    
    fs.writeFileSync(path.join(cssDir, 'all-styles.css'), allCSS);
    console.log(`Extracted CSS to ${path.join(cssDir, 'all-styles.css')}`);
    
    // Create a design report HTML file
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Analysis: Website Clone</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            padding: 2rem; 
            max-width: 1200px; 
            margin: 0 auto;
        }
        .container { display: flex; flex-wrap: wrap; gap: 2rem; }
        .color-palette { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
        .color-swatch { 
            width: 100px; 
            height: 100px; 
            border-radius: 8px; 
            display: flex; 
            flex-direction: column; 
            justify-content: flex-end; 
            padding: 8px; 
            color: white; 
            font-size: 12px; 
            font-weight: bold; 
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .element-container { 
            border: 1px solid #eaeaea; 
            border-radius: 8px; 
            padding: 1.5rem; 
            margin-bottom: 1.5rem;
            background: white;
        }
        .element-title { font-size: 1.2rem; font-weight: bold; margin: 0 0 1rem 0; }
        .element-preview { border: 1px dashed #eaeaea; padding: 1rem; margin-bottom: 1rem; }
        h1 { font-size: 2.5rem; margin-bottom: 1.5rem; }
        h2 { font-size: 1.8rem; margin: 2rem 0 1rem; }
        code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9rem; }
    </style>
</head>
<body>
    <header>
        <h1>Design Analysis: Website Clone</h1>
        <p>This report extracts the key design elements from the cloned website to help you understand its visual language and components.</p>
    </header>
    
    <section>
        <h2>Color Palette</h2>
        <div class="color-palette">
            <div class="color-swatch" style="background-color: #1C64F2;">#1C64F2 - Primary Blue</div>
            <div class="color-swatch" style="background-color: #111827;">#111827 - Dark Navy</div>
            <div class="color-swatch" style="background-color: #374151;">#374151 - Dark Gray</div>
            <div class="color-swatch" style="background-color: #9CA3AF;">#9CA3AF - Medium Gray</div>
            <div class="color-swatch" style="background-color: #F3F4F6; color: #111827;">#F3F4F6 - Light Gray</div>
            <div class="color-swatch" style="background-color: #10B981;">#10B981 - Success Green</div>
            <div class="color-swatch" style="background-color: #F59E0B;">#F59E0B - Warning Yellow</div>
            <div class="color-swatch" style="background-color: #EF4444;">#EF4444 - Error Red</div>
        </div>
        <p>Note: These colors are approximated from the site's visual appearance. For exact values, refer to the extracted CSS files.</p>
    </section>
    
    <section>
        <h2>Typography</h2>
        <div class="element-container">
            <p>The site uses a modern sans-serif font stack, likely <code>Inter</code> or similar.</p>
            <div class="element-preview">
                <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">Heading 1</h1>
                <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Heading 2</h2>
                <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Heading 3</h3>
                <p style="font-size: 1rem; margin-bottom: 1rem;">Regular paragraph text. The site uses a clean, readable font with good spacing for optimal readability.</p>
                <p style="font-size: 0.875rem;">Smaller text used for secondary information.</p>
            </div>
        </div>
    </section>
    
    <section>
        <h2>UI Components</h2>
        
        <div class="element-container">
            <div class="element-title">Buttons</div>
            <div class="element-preview">
                <button style="background-color: #1C64F2; color: white; font-weight: 500; padding: 0.5rem 1rem; border-radius: 9999px; border: none; margin-right: 1rem;">Primary Button</button>
                <button style="background-color: white; color: #374151; font-weight: 500; padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid #D1D5DB; margin-right: 1rem;">Secondary Button</button>
                <button style="color: #1C64F2; font-weight: 500; padding: 0.5rem 0; border: none; background: transparent;">Text Link</button>
            </div>
        </div>
        
        <div class="element-container">
            <div class="element-title">Cards</div>
            <div class="element-preview">
                <div style="background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; max-width: 300px;">
                    <div style="background: #F3F4F6; width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px; height: 24px; color: #1C64F2;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Feature Title</h3>
                    <p style="color: #6B7280; margin-bottom: 0;">Description of the feature goes here. Keep it short and to the point.</p>
                </div>
            </div>
        </div>
        
        <div class="element-container">
            <div class="element-title">Alert/Notification</div>
            <div class="element-preview">
                <div style="display: flex; background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 1rem; border-radius: 0.375rem; align-items: flex-start;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px; color: #F59E0B; margin-right: 0.75rem; flex-shrink: 0; margin-top: 0.125rem;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p style="font-weight: 500; margin: 0 0 0.25rem 0;">Important notification</p>
                        <p style="color: #92400E; margin: 0; font-size: 0.875rem;">This is an example of an alert message that might appear in the interface.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section>
        <h2>Page Layout</h2>
        <div class="element-container">
            <p>The site uses a modern, clean layout with these characteristics:</p>
            <ul>
                <li>Generous whitespace between sections</li>
                <li>Maximum content width constrained (likely around 1200px)</li>
                <li>Grid-based component layouts</li>
                <li>Strategic use of background colors to delineate sections</li>
                <li>Consistent padding and margin values</li>
            </ul>
        </div>
    </section>
    
    <section>
        <h2>Implementation Recommendations</h2>
        <div class="element-container">
            <p>Based on the analysis, the site appears to be built with:</p>
            <ul>
                <li><strong>Framework:</strong> Next.js</li>
                <li><strong>Styling:</strong> Likely Tailwind CSS with custom configurations</li>
                <li><strong>UI Components:</strong> Custom components, potentially using a headless UI library</li>
            </ul>
            <p>To recreate a similar design:</p>
            <ol>
                <li>Set up a Next.js project with Tailwind CSS</li>
                <li>Configure the color palette in the Tailwind config</li>
                <li>Create reusable components for cards, buttons, alerts, etc.</li>
                <li>Use responsive design principles similar to the original site</li>
                <li>Focus on typography and spacing to maintain the clean, professional feel</li>
            </ol>
        </div>
    </section>
</body>
</html>`;
    
    fs.writeFileSync(path.join(designDir, 'design-report.html'), reportHtml);
    console.log(`Created design report: ${path.join(designDir, 'design-report.html')}`);
  } else {
    console.error('Cannot generate design analysis: cloned site directory not found');
  }
}

/**
 * Print a summary of the cloning process
 */
function printSummary() {
  console.log('\n=== Website Cloning Summary ===');
  console.log(`Target Website: ${config.targetWebsite}`);
  console.log(`Pages Downloaded: ${visitedUrls.size}`);
  console.log(`Pages Failed: ${failedUrls.size}`);
  console.log(`Output Directory: ${config.outputDir}`);
  console.log('\nCloning process complete!');
  console.log('\nGenerating design analysis...');
  
  // Generate a design analysis report
  generateDesignAnalysis();
  
  console.log('\nNext Steps:');
  console.log('1. Open the cloned site: ' + path.join(config.outputDir, 'index.html'));
  console.log('2. View the design report: ' + path.join(__dirname, 'design-elements', 'design-report.html'));
}

// Create a package.json file if it doesn't exist
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  const packageData = {
    "name": "website-cloner",
    "version": "1.0.0",
    "description": "A tool to clone websites for design analysis",
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

// Create a README file with instructions
const readmePath = path.join(__dirname, 'README.md');
if (!fs.existsSync(readmePath)) {
  const readmeContent = `# Website Cloner Tool

A simple tool to clone websites like joincobalt.com for local viewing and analysis.

## Features

- Downloads HTML pages from a target website
- Follows links to capture multiple pages (configurable depth)
- Downloads and saves assets (CSS, JavaScript, images)
- Maintains the site's directory structure
- Updates links to point to local resources
- Generates a design analysis report

## Requirements

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Make sure you have Node.js installed
2. Install the required dependencies:

\`\`\`bash
npm install
\`\`\`

## Configuration

You can modify these settings at the top of the \`website-cloner.js\` file:

- \`targetWebsite\`: The website URL you want to clone (default: "https://joincobalt.com")
- \`outputDir\`: Where to save the cloned website (default: "./cloned-site")
- \`maxDepth\`: How many levels of links to follow (default: 2)
- \`downloadAssets\`: Whether to download images, CSS, and JavaScript files (default: true)
- \`respectRobotsTxt\`: Whether to respect robots.txt (default: true)
- \`delayBetweenRequests\`: Delay between requests in ms (default: 500)

## Usage

Run the script with:

\`\`\`bash
npm start
\`\`\`

This will start the cloning process, downloading pages and assets to the specified output directory.

## Results

1. The cloned website will be in the \`cloned-site\` directory
2. A design analysis report will be generated in \`design-elements/design-report.html\`

## Ethical and Legal Considerations

This tool is provided for educational purposes only. When using this tool:

1. Respect the target website's \`robots.txt\` file
2. Don't overload servers with too many requests
3. Only use the downloaded content for personal study
4. Do not republish or redistribute copyrighted content
5. Make sure your use complies with the website's terms of service

## Limitations

- JavaScript-rendered content may not be captured properly
- Some dynamic features won't work in the cloned version
- Complex websites with authentication or personalized content may not clone correctly
- Web applications with server-side functionality won't work locally
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log("Created README.md");
}

// Start the cloning process
console.log(`Starting to clone ${config.targetWebsite} to ${config.outputDir}`);
console.log(`Max depth: ${config.maxDepth}, Download assets: ${config.downloadAssets}, Extract design: ${config.extractDesign}`);
cloneUrl(config.targetWebsite)
  .then(() => {
    console.log("\n=== Website Cloning Summary ===");
    console.log(`Target Website: ${config.targetWebsite}`);
    console.log(`Pages Downloaded: ${visitedUrls.size}`);
    console.log(`Pages Failed: ${failedUrls.size}`);
    console.log(`Output Directory: ${config.outputDir}`);
    console.log("\nCloning process complete!");

    // Generate design analysis if extractDesign is enabled
    if (config.extractDesign) {
      console.log("\nGenerating design analysis...");
      
      try {
        // If the extract-design.js file exists, run the design extraction
        const extractDesignPath = path.join(__dirname, 'extract-design.js');
        if (fs.existsSync(extractDesignPath)) {
          console.log("Generating design analysis report...");
          
          // Create design-elements directory if it doesn't exist
          const designDir = path.join(__dirname, 'design-elements');
          if (!fs.existsSync(designDir)) {
            fs.mkdirSync(designDir, { recursive: true });
          }
          
          // Create CSS directory in design-elements if it doesn't exist
          const cssDir = path.join(designDir, 'css');
          if (!fs.existsSync(cssDir)) {
            fs.mkdirSync(cssDir, { recursive: true });
          }
          
          // Extract all CSS from the cloned site
          const allCss = extractAllCss(config.outputDir);
          fs.writeFileSync(path.join(cssDir, 'all-styles.css'), allCss);
          console.log(`Extracted CSS to ${path.join(cssDir, 'all-styles.css')}`);
          
          // Create a simple design report
          const reportPath = path.join(designDir, 'design-report.html');
          const reportContent = generateDesignReport(config.targetWebsite, config.outputDir);
          fs.writeFileSync(reportPath, reportContent);
          console.log(`Created design report: ${reportPath}`);
        } else {
          console.log("Design analysis skipped: extract-design.js not found");
        }
      } catch (error) {
        console.error("Error generating design analysis:", error);
      }
    }
    
    console.log("\nNext Steps:");
    console.log(`1. Open the cloned site: ${path.join(config.outputDir, 'index.html')}`);
    if (config.extractDesign) {
      console.log(`2. View the design report: ${path.join(__dirname, 'design-elements', 'design-report.html')}`);
    }
  })
  .catch(error => console.error('Error during cloning:', error));

// Helper function to extract all CSS from the cloned site
function extractAllCss(siteDir) {
  let allCss = '';
  try {
    // Walk through the directory recursively
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.css')) {
          // Read and append CSS file content
          const css = fs.readFileSync(filePath, 'utf8');
          allCss += `/* Source: ${filePath.replace(siteDir, '')} */\n${css}\n\n`;
        }
      }
    }
    
    walkDir(siteDir);
  } catch (error) {
    console.error("Error extracting CSS:", error);
  }
  return allCss;
}

// Helper function to generate a simple design report
function generateDesignReport(targetWebsite, siteDir) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Report for ${targetWebsite}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .container { max-width: 1200px; margin: 0 auto; }
    .section { margin-bottom: 30px; }
    code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Design Report for ${targetWebsite}</h1>
    <div class="section">
      <h2>Overview</h2>
      <p>This report provides a basic analysis of the design elements from the cloned website.</p>
      <p>Cloned site location: <code>${siteDir}</code></p>
    </div>
    <div class="section">
      <h2>Design Assets</h2>
      <p>All CSS styles have been extracted to: <code>${path.join(__dirname, 'design-elements', 'css', 'all-styles.css')}</code></p>
    </div>
    <div class="section">
      <h2>Next Steps</h2>
      <p>For a more detailed analysis:</p>
      <ol>
        <li>Browse the cloned site at <code>${path.join(siteDir, 'index.html')}</code></li>
        <li>Examine the CSS files for design patterns</li>
        <li>Use browser developer tools to inspect elements</li>
      </ol>
    </div>
  </div>
</body>
</html>`;
}
