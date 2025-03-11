const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Static Site Generator
 * 
 * This script converts a cloned Next.js site to a simplified static HTML site
 * that can be opened directly in browsers without server-side rendering.
 */

// Configuration
const clonedSitesDir = path.join(__dirname, 'cloned-sites');
const staticSitesDir = path.join(__dirname, 'static-sites');

// Get site name from command line arguments
const args = process.argv.slice(2);
let siteName = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--site' && i + 1 < args.length) {
    siteName = args[i + 1];
    break;
  }
}

// If no site specified, list available sites
if (!siteName) {
  console.log('Please specify a site to convert:');
  try {
    const sites = fs.readdirSync(clonedSitesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (sites.length === 0) {
      console.log('  No sites found. Run the website cloner first.');
    } else {
      sites.forEach(site => console.log(`  - ${site}`));
      console.log(`\nRun with: node static-generator.js --site [site-name]`);
    }
  } catch (error) {
    console.log('  Could not read cloned-sites directory.');
  }
  process.exit(1);
}

// Set input and output directories
const inputDir = path.join(clonedSitesDir, siteName);
const outputDir = path.join(staticSitesDir, siteName);

// Check if input directory exists
if (!fs.existsSync(inputDir)) {
  console.error(`Error: Site directory ${inputDir} not found.`);
  process.exit(1);
}

// Create output directories
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create assets directories
const assetsDir = path.join(outputDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const cssDir = path.join(assetsDir, 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

const jsDir = path.join(assetsDir, 'js');
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

const imagesDir = path.join(assetsDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Process HTML files recursively
function processDirectory(dir, outputDirPath, relativePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const outputPath = path.join(outputDirPath, entry.name);
    const relPath = path.join(relativePath, entry.name);
    
    if (entry.isDirectory()) {
      // Create corresponding output directory
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      // Process files in the directory
      processDirectory(fullPath, outputPath, relPath);
    } else if (entry.name.endsWith('.html')) {
      // Process HTML file
      processHtmlFile(fullPath, outputPath, relPath);
    } else if (entry.name.endsWith('.css')) {
      // Copy CSS to assets
      const cssOutputPath = path.join(cssDir, `${relPath.replace(/\//g, '-')}`);
      fs.copyFileSync(fullPath, cssOutputPath);
    } else if (entry.name.endsWith('.js')) {
      // Just copy JavaScript files (they likely won't work but good for reference)
      const jsOutputPath = path.join(jsDir, `${relPath.replace(/\//g, '-')}`);
      fs.copyFileSync(fullPath, jsOutputPath);
    } else if (entry.name.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
      // Copy images
      const imageOutputPath = path.join(imagesDir, `${relPath.replace(/\//g, '-')}`);
      fs.copyFileSync(fullPath, imageOutputPath);
    }
  }
}

// Process an HTML file
function processHtmlFile(inputPath, outputPath, relativePath) {
  try {
    const html = fs.readFileSync(inputPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;
    
    // Remove problematic scripts that won't work statically
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      script.remove();
    });
    
    // Add a warning banner
    const banner = document.createElement('div');
    banner.style.backgroundColor = '#f8d7da';
    banner.style.color = '#721c24';
    banner.style.padding = '10px 15px';
    banner.style.margin = '0 0 20px 0';
    banner.style.borderRadius = '4px';
    banner.style.fontSize = '14px';
    banner.style.position = 'relative';
    banner.style.zIndex = '9999';
    banner.innerHTML = `
      <strong>Static Preview Mode:</strong> This is a simplified static version of the cloned site.
      Interactive features are disabled, and some styles may be missing.
      <button onclick="this.parentNode.style.display='none'" style="float:right; background:none; border:none; cursor:pointer; font-weight:bold;">×</button>
    `;
    
    // Insert the banner at the beginning of the body
    if (document.body) {
      document.body.insertBefore(banner, document.body.firstChild);
    }
    
    // Add base styling to make content visible
    const style = document.createElement('style');
    style.textContent = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      a {
        color: #0070f3;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      button, .button, [class*="btn"] {
        display: inline-block;
        background-color: #0070f3;
        color: white;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        border: none;
        cursor: pointer;
        text-decoration: none;
      }
      [class*="card"], [class*="box"], [class*="container"] {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-weight: 600;
        line-height: 1.2;
      }
      h1 { font-size: 2.5rem; }
      h2 { font-size: 2rem; }
      h3 { font-size: 1.75rem; }
      p { margin-top: 0; margin-bottom: 1rem; }
    `;
    document.head.appendChild(style);
    
    // Process CSS links to point to our assets
    const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
    styleLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const cssFileName = href.split('/').pop();
        const newHref = `./assets/css/${cssFileName}`;
        link.setAttribute('href', newHref);
      }
    });
    
    // Process images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        // Skip already processed images or data URLs
        if (src.startsWith('data:') || src.startsWith('./assets/')) {
          return;
        }
        
        // Create a filename from the src
        let imgFilename;
        if (src.includes('/')) {
          imgFilename = src.split('/').pop();
        } else {
          imgFilename = src;
        }
        
        // Ensure unique filenames
        imgFilename = `${Date.now()}-${imgFilename}`;
        img.setAttribute('src', `./assets/images/${imgFilename}`);
        
        // Try to copy the image if it exists locally
        try {
          const imgPath = path.join(inputDir, src);
          if (fs.existsSync(imgPath)) {
            fs.copyFileSync(imgPath, path.join(imagesDir, imgFilename));
          }
        } catch (error) {
          // It's okay if this fails - the image might not exist locally
        }
      }
    });
    
    // Fix links
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        // Convert links to simplified format
        if (href === '/') {
          link.setAttribute('href', './index.html');
        } else {
          // Simplify path and add .html extension
          const simplifiedPath = href.replace(/^\/?/, './').replace(/\/$/, '') + '.html';
          link.setAttribute('href', simplifiedPath);
        }
      }
    });
    
    // Save processed HTML
    fs.writeFileSync(outputPath, dom.serialize());
    console.log(`Processed: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing HTML file ${inputPath}:`, error.message);
  }
}

// Main execution
console.log(`Converting cloned site "${siteName}" to static HTML...`);
console.log(`Input: ${inputDir}`);
console.log(`Output: ${outputDir}`);

processDirectory(inputDir, outputDir);

console.log(`\nConversion complete!`);
console.log(`You can open the static site by opening ${path.join(outputDir, 'index.html')} in your browser.`);
