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

## Command Line Usage

For more control over the scraping process, you can use the command line directly:

### Basic Command Syntax

```bash
node website-cloner.js --url=WEBSITE_URL [OPTIONS]
```

### Example: Cloning a Specific Website (joincobalt.com)

```bash
node website-cloner.js --url=https://joincobalt.com --assets --depth=2
```

### Common Command Line Options

- `--url=URL`: The website to scrape (required)
- `--output=PATH`: Custom output directory (default: ./cloned-site)
- `--depth=NUMBER`: How many link levels to follow (default: 2)
- `--assets`: Download all assets (CSS, JS, images)
- `--no-assets`: Skip downloading assets
- `--extract`: Enable design analysis

### Examples for Different Use Cases

**Scrape a website with custom output location:**
```bash
node website-cloner.js --url=https://joincobalt.com --output=./sites/cobalt
```

**Quick shallow scrape (homepage only):**
```bash
node website-cloner.js --url=https://joincobalt.com --depth=0
```

**Deep scrape with design analysis:**
```bash
node website-cloner.js --url=https://joincobalt.com --assets --depth=3 --extract
```

## Output Files

The cloned website will be saved to the `cloned-site` directory in the project root folder, unless you specify a custom output path.

When you run the command with `--extract`, you'll also get:
- Design analysis report: `design-elements/design-report.html`
- Extracted CSS: `design-elements/css/all-styles.css`

## Viewing the Cloned Website

To browse the cloned website locally:
1. Navigate to the output directory (e.g., `cloned-site`)
2. Open `index.html` in your browser

For a more advanced setup with a local server:
```bash
node serve-site.js --dir=cloned-site --port=8080
```
Then visit http://localhost:8080 in your browser.

## Troubleshooting

- **Error: Node.js is not installed:**
  - Download and install Node.js from [nodejs.org](https://nodejs.org/)

- **Port already in use:**
  - The server will automatically try the next port (3002) if 3001 is busy
  - You may need to adjust the URL in the browser if using a different port

- **Connection Error:**
  - Make sure both the backend server and frontend GUI are running
  - Check that firewall settings allow connections on ports 3000 and 3001

- **Large Websites:**
  - For very large websites, use a smaller `--depth` value (1 or 2)
  - Some websites may have hundreds or thousands of pages

- **Blocked by Website:**
  - Some websites might block scraping attempts
  - Look for error messages about "403 Forbidden" in the logs

## Need More Help?

See the detailed documentation in the `README.md` file. 