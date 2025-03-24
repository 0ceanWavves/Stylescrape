const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // Import child_process
const app = express();
const port = 3001; // Use a different port than your React app (which defaults to 3000)

app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON request bodies

// API endpoint for cloning
app.post('/api/clone', (req, res) => {
    const { url, cloneAssets, extractLibraries } = req.body;

    // Construct the command to execute your existing script
    let command = `node website-cloner.js --url="${url}"`;
    if (cloneAssets) {
        command += ' --assets'; // Add options as needed
    }
    if (extractLibraries) {
        command += ' --extract'; // Add options as needed
    }

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send({ error: 'Cloning failed', details: stderr });
            return;
        }
        // Assuming your script outputs JSON, parse it and send it back
        try {
            const result = JSON.parse(stdout);
            res.send(result);
        } catch (parseError) {
            console.error(`Parse error: ${parseError}`);
            res.status(500).send({ error: 'Failed to parse results', details: stdout });
        }
    });
});

// Add other API endpoints as needed (e.g., for extracting design, serving the site)

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}); 