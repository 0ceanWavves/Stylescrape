const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 8080; // Changed to higher port 8080 that doesn't require admin privileges
const DEFAULT_SITE = 'joincobalt.com';

// Get site name from command line arguments
const args = process.argv.slice(2);
let siteName = DEFAULT_SITE;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--site' && i + 1 < args.length) {
    siteName = args[i + 1];
    break;
  }
}

const SITE_DIR = path.join(__dirname, 'cloned-sites', siteName);

// Check if site directory exists
if (!fs.existsSync(SITE_DIR)) {
  console.error(`Error: Site directory ${SITE_DIR} not found.`);
  console.log('Available sites:');
  
  try {
    const sites = fs.readdirSync(path.join(__dirname, 'cloned-sites'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (sites.length === 0) {
      console.log('  No sites found. Run the website cloner first.');
    } else {
      sites.forEach(site => console.log(`  - ${site}`));
      console.log(`\nRun with: node serve-site.js --site [site-name]`);
    }
  } catch (error) {
    console.log('  Could not read cloned-sites directory.');
  }
  
  process.exit(1);
}

// MIME types for common file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.txt': 'text/plain'
};

// Create server
const server = http.createServer((req, res) => {
  // Handle URL path
  let url = req.url;
  
  // Default to index.html for root path
  if (url === '/') {
    url = '/index.html';
  }
  
  // Remove query parameters
  url = url.split('?')[0];
  
  // Construct the file path
  let filePath = path.join(SITE_DIR, url);
  
  // Check if path exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If the path doesn't exist, check if it's a directory path without trailing slash
      if (!url.endsWith('/')) {
        const dirPath = filePath;
        const indexPath = path.join(dirPath, 'index.html');
        
        fs.access(dirPath, fs.constants.F_OK, (dirErr) => {
          if (!dirErr && fs.statSync(dirPath).isDirectory()) {
            // Check if there's an index.html file
            fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
              if (!indexErr) {
                filePath = indexPath;
                serveFile(filePath, res);
              } else {
                send404(res);
              }
            });
          } else {
            send404(res);
          }
        });
      } else {
        send404(res);
      }
      return;
    }
    
    // If path exists, check if it's a directory
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      // Try to serve index.html from the directory
      filePath = path.join(filePath, 'index.html');
      fs.access(filePath, fs.constants.F_OK, (indexErr) => {
        if (indexErr) {
          send404(res);
        } else {
          serveFile(filePath, res);
        }
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

// Function to serve a file
function serveFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        send404(res);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    // Special handling for HTML files to fix paths if needed
    if (contentType === 'text/html') {
      content = fixHtmlPaths(content.toString(), filePath);
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

// Function to fix paths in HTML content
function fixHtmlPaths(htmlContent, filePath) {
  // Convert file:// paths to relative paths
  htmlContent = htmlContent.replace(/file:\/\/\/_next\//g, '/_next/');
  
  // Fix base paths
  const relativePath = path.relative(SITE_DIR, path.dirname(filePath));
  const depth = relativePath.split(path.sep).filter(Boolean).length;
  const basePath = depth > 0 ? '../'.repeat(depth) : './';
  
  return htmlContent;
}

// Function to send 404 response
function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; }
          h1 { color: #e74c3c; }
          a { color: #3498db; }
        </style>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you requested could not be found in the cloned site.</p>
        <p><a href="/">Go to home page</a></p>
      </body>
    </html>
  `);
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running for "${siteName}" at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server.');
});
