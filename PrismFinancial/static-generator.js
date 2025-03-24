const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const clonedSiteDir = path.join(__dirname, 'cloned-site');
const staticSiteDir = path.join(__dirname, 'static-site');

// Create output directory
if (!fs.existsSync(staticSiteDir)) {
  fs.mkdirSync(staticSiteDir, { recursive: true });
}

// Create CSS directory
const cssDir = path.join(staticSiteDir, 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

// Create images directory
const imagesDir = path.join(staticSiteDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to process HTML files
function processHtmlFile(filePath, outputPath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Remove all scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Extract and consolidate CSS
    const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
    let combinedCSS = '';
    
    styleLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const cssPath = path.join(clonedSiteDir, href.replace(/^\//, ''));
        if (fs.existsSync(cssPath)) {
          const css = fs.readFileSync(cssPath, 'utf8');
          combinedCSS += css + '\n';
        }
      }
      link.remove();
    });

    // Save combined CSS
    const cssFilename = 'styles.css';
    fs.writeFileSync(path.join(cssDir, cssFilename), combinedCSS);
    
    // Add new stylesheet link
    const newStyleLink = document.createElement('link');
    newStyleLink.setAttribute('rel', 'stylesheet');
    newStyleLink.setAttribute('href', '../css/styles.css');
    document.head.appendChild(newStyleLink);

    // Process images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        try {
          const isAbsoluteUrl = src.startsWith('http://') || src.startsWith('https://');
          const isNextImage = src.includes('_next/image');
          
          if (isNextImage || isAbsoluteUrl) {
            // For Next.js image URLs or absolute URLs, use a placeholder
            const imageName = `placeholder-${Math.random().toString(36).substring(7)}.png`;
            img.setAttribute('src', `../images/${imageName}`);
            
            // Create a simple placeholder image text file
            fs.writeFileSync(
              path.join(imagesDir, imageName), 
              `This is a placeholder for: ${src}`
            );
          } else {
            // For relative URLs
            const imagePath = path.join(clonedSiteDir, src.replace(/^\//, ''));
            const imageName = path.basename(src);
            
            if (fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()) {
              fs.copyFileSync(imagePath, path.join(imagesDir, imageName));
              img.setAttribute('src', `../images/${imageName}`);
            }
          }
        } catch (error) {
          console.error(`Error processing image ${src}:`, error.message);
        }
      }
    });

    // Fix other asset references
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        // Convert absolute paths to relative
        const newPath = href === '/' ? '../index.html' : `..${href}.html`;
        link.setAttribute('href', newPath);
      } else if (href && href.startsWith('#')) {
        // Keep anchor links as is
      } else if (href && !href.startsWith('http')) {
        // Fix other relative links
        link.setAttribute('href', '#');
      }
    });

    // Generate clean HTML
    const cleanHtml = dom.serialize();
    fs.writeFileSync(outputPath, cleanHtml);
    console.log(`Processed: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively process HTML files
function processDirectory(dirPath, outputDirPath, isRoot = false) {
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(dirPath, entry.name);
    const destPath = path.join(outputDirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(srcPath, destPath);
    } else if (entry.name === 'index.html') {
      processHtmlFile(srcPath, destPath);
    }
  }
}

// Start processing
console.log(`Converting cloned Next.js site to static HTML...`);
processDirectory(clonedSiteDir, staticSiteDir, true);
console.log(`Done! You can open ${path.join(staticSiteDir, 'index.html')} in your browser.`);
