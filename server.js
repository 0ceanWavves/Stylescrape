const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all origins (for development)
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
        
        // Return success with progress steps and libraries
        res.status(200).json({
            success: true,
            message: 'Website cloning completed',
            progress: progressSteps,
            libraries: detectedLibraries
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