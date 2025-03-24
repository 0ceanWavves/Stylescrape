# StyleScrape: Website Scraping Toolkit

A comprehensive toolkit for scraping, analyzing, and working with websites locally. This tool can download websites, analyze their design elements, and serve them locally for further inspection.

## Components

This toolkit consists of several tools:

1. **Website Cloner** (`website-cloner.js`): Downloads a website for local analysis
2. **Design Extractor** (`extract-design.js`): Analyzes design elements from cloned websites
3. **Site Server** (`serve-site.js`): Serves cloned websites locally
4. **Static Generator** (`static-generator.js`): Generates static files from cloned sites
5. **Website Cloner GUI** (`website-cloner-gui/`): A modern graphical interface for the cloning tool

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later recommended)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/stylescrape.git
   cd stylescrape
   ```

2. Install dependencies:
   ```bash
   npm install
   cd website-cloner-gui
   npm install
   cd ..
   ```

### Quick Start

The easiest way to start is using the provided scripts:

#### Windows
```
run-scraper.bat
```

#### Mac/Linux
```bash
chmod +x run-scraper.sh
./run-scraper.sh
```

## Using the GUI

1. Start the GUI application:
   ```bash
   # Windows
   start-gui.bat
   
   # Mac/Linux
   ./start-gui.sh
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Enter a website URL, select options, and click "Clone Website"

## File Types Downloaded

The tool downloads the following file types:

- HTML files for web pages
- CSS stylesheets
- JavaScript files
- Images (PNG, JPG, GIF, SVG, etc.)
- Fonts (WOFF, WOFF2, TTF, EOT)
- JSON data files
- XML files

## Deployment on Netlify

To deploy this tool on Netlify:

1. Push your repository to GitHub
2. Log in to Netlify and create a new site from Git
3. Select your repository
4. Configure build settings:
   - Build command: `cd website-cloner-gui && npm install && npm run build`
   - Publish directory: `website-cloner-gui/build`
5. Click "Deploy site"

## License

This project is licensed under the MIT License - see the LICENSE file for details.
