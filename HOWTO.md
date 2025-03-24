# Website Scraper Quick Start Guide

This document provides quick instructions to get the Website Scraper up and running.

## Quick Start

### Windows Users

1. **Run the Automatic Launcher:**
   - Double-click `run-scraper.bat`
   - This will install dependencies if needed and start the application

2. **Manual Steps (if the automatic launcher doesn't work):**
   - Install dependencies: Double-click `install-dependencies.bat`
   - Start the application: Double-click `start-gui.bat`

### Linux/Mac Users

1. **Run the Automatic Launcher:**
   ```bash
   chmod +x run-scraper.sh
   ./run-scraper.sh
   ```

2. **Manual Steps (if the automatic launcher doesn't work):**
   ```bash
   # Make scripts executable
   chmod +x *.sh
   
   # Install dependencies
   ./install-dependencies.sh
   
   # Start the application
   ./start-gui.sh
   ```

## Using the Website Scraper

1. **Enter a URL:**
   - Type in the website URL you want to clone (e.g., `example.com`)
   - No need to add https:// - it will be added automatically if missing

2. **Choose Options:**
   - **Clone Assets:** Download images, CSS, and JavaScript files
   - **Extract Libraries:** Detect libraries and technologies used on the website

3. **Click "Clone Website"**
   - The process will start and you'll see real-time progress
   - When complete, you'll see a success message and results

4. **View Results:**
   - **Libraries:** A list of detected libraries and technologies
   - **Cloning Log:** A detailed log of the cloning process

## Output Files

The cloned website will be saved to the `cloned-site` directory in the project root folder.

## Troubleshooting

- **Error: Node.js is not installed:**
  - Download and install Node.js from [nodejs.org](https://nodejs.org/)

- **Port already in use:**
  - The server will automatically try the next port (3002) if 3001 is busy
  - You may need to adjust the URL in the browser if using a different port

- **Connection Error:**
  - Make sure both the backend server and frontend GUI are running
  - Check that firewall settings allow connections on ports 3000 and 3001

## Need More Help?

See the detailed documentation in the `README.md` file. 