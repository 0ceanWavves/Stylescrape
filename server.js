const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins (for development)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add proper Content-Security-Policy headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' localhost:*; font-src 'self' data:;"
  );
  next();
});

app.use(express.json()); // Parse JSON request bodies

// Helper function to extract libraries from output
function extractLibraries(output) {
    if (!output || typeof output !== 'string') {
        return [];
    }
    
    const libraryPattern = /Detected library: ([\w\d\s\-\.]+)/g;
    const libraries = [];
    let match;
    
    while ((match = libraryPattern.exec(output)) !== null) {
        libraries.push(match[1].trim());
    }
    
    // Add some default libraries if none were found (for testing/demo purposes)
    if (libraries.length === 0) {
        const possibleLibraries = ['jQuery', 'React', 'Bootstrap', 'Angular', 'Vue.js', 'Tailwind CSS'];
        // Check if any of these terms appear in the output
        possibleLibraries.forEach(lib => {
            if (output.toLowerCase().includes(lib.toLowerCase())) {
                libraries.push(lib);
            }
        });
    }
    
    return libraries;
}

// Serve favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon requests
});

// API endpoint for cloning
app.post('/api/clone', (req, res) => {
    const { url, cloneAssets, extractLibraries, outputPath } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Starting to clone: ${url}`);
    console.log(`Options: cloneAssets=${cloneAssets}, extractLibraries=${extractLibraries}, outputPath=${outputPath || './cloned-site'}`);

    // Construct the command to execute the website-cloner script
    let args = ['website-cloner.js', `--url=${url}`];
    
    if (cloneAssets) {
        args.push('--assets');
    }
    
    if (extractLibraries) {
        args.push('--extract');
    }

    if (outputPath) {
        args.push(`--output=${outputPath}`);
    }

    // Use spawn instead of exec to get real-time output
    const process = spawn('node', args);
    
    let stdoutData = '';
    let stderrData = '';
    const progressSteps = [];

    // Collect stdout data
    process.stdout.on('data', (data) => {
        const output = data.toString();
        stdoutData += output;
        
        // Split by lines and add non-empty lines to progress
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                progressSteps.push(line.trim());
                console.log(line.trim()); // Log to server console
            }
        }
    });

    // Collect stderr data
    process.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error(`stderr: ${data}`);
    });

    // Handle process completion
    process.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        
        if (code !== 0) {
            return res.status(500).json({ 
                error: 'Cloning process failed', 
                details: stderrData,
                code
            });
        }
        
        // Extract libraries if requested
        const detectedLibraries = extractLibraries(stdoutData);
        
        // Return success with progress steps, libraries, and download URL
        res.status(200).json({
            success: true,
            message: 'Website cloning completed',
            progress: progressSteps,
            libraries: detectedLibraries,
            downloadUrl: `/api/download/${outputPath || 'cloned-site'}`
        });
    });
});

// API endpoint for serving cloned sites
app.get('/api/sites', (req, res) => {
    // Implementation for listing cloned sites
    res.json({ message: 'Site listing endpoint (not implemented yet)' });
});

// API endpoint for extracting design
app.post('/api/extract-design', (req, res) => {
    // Implementation for design extraction
    res.json({ message: 'Design extraction endpoint (not implemented yet)' });
});

// Serve static files from the cloned-site directory
app.use('/sites', express.static('cloned-site'));

// Serve static files from the public directory
app.use(express.static('public'));

// Add new endpoint for downloading as zip
app.get('/api/download/:sitePath', (req, res) => {
    const sitePath = path.join(process.cwd(), req.params.sitePath);
    
    // Check if directory exists
    if (!fs.existsSync(sitePath)) {
        return res.status(404).json({ error: 'Site directory not found' });
    }

    // Create a zip file
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    // Set the headers
    res.attachment('cloned-site.zip');

    // Pipe archive data to the response
    archive.pipe(res);

    // Add the directory contents to the archive
    archive.directory(sitePath, false);

    // Finalize the archive
    archive.finalize();
});

// Root path handler (fallback to API info if HTML isn't available)
app.get('/', (req, res, next) => {
    // If the accept header prefers JSON or if public/index.html doesn't exist,
    // send the JSON response
    if (req.accepts('html')) {
        next(); // Will go to the next middleware (static files)
    } else {
        res.json({ 
            message: 'Website Cloner API Server',
            endpoints: {
                clone: 'POST /api/clone',
                sites: 'GET /api/sites',
                extractDesign: 'POST /api/extract-design',
                static: 'GET /sites/{file}'
            },
            status: 'running'
        });
    }
});

// Handle 404 errors - must be the last route
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: `Route ${req.originalUrl} not found` });
});

console.log(`Attempting to start server on port ${PORT}`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT+1}...`);
        app.listen(PORT+1, () => {
            console.log(`Server running on port ${PORT+1}`);
        });
    } else {
        console.error(e);
    }
}); 