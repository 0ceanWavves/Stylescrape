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

## Command Line Usage

You can also run the scraper directly from the command line, which gives you more control over the scraping process:

### Basic Command

```bash
node website-cloner.js --url=https://example.com
```

### Full Command with Options

```bash
node website-cloner.js --url=https://joincobalt.com --assets --depth=2 --output=./cloned-sites/cobalt
```

### Available Options

- `--url=URL`: The target website to clone (required)
- `--output=PATH`: Where to save files (default: ./cloned-site)
- `--depth=NUMBER`: How many levels of links to follow (default: 2)
- `--assets`: Download assets (CSS, JS, images, etc.)
- `--no-assets`: Skip downloading assets
- `--extract`: Extract and analyze design elements

### Example: Cloning joincobalt.com

To clone the Cobalt Financial website:

```bash
node website-cloner.js --url=https://joincobalt.com --assets --depth=2
```

This will:
1. Download the joincobalt.com homepage and all linked pages up to 2 levels deep
2. Download all assets (stylesheets, JavaScript, images, etc.)
3. Save everything to the ./cloned-site directory
4. Generate a design analysis report

### Understanding the Output

After running the command, you'll find:

- **Cloned Website**: `E:\projects\stylescrape\cloned-site\` (or your project root)
- **Design Analysis**: `E:\projects\stylescrape\design-elements\design-report.html`
- **Extracted CSS**: `E:\projects\stylescrape\design-elements\css\all-styles.css`

The tool will provide a summary showing how many pages were downloaded and any failures.

## Local Development Structure

The project is organized as follows:

```
stylescrape/
├── website-cloner.js        # Main scraper script
├── extract-design.js        # Design analysis tool
├── serve-site.js            # Local server for cloned sites
├── static-generator.js      # Static site generator
├── server.js                # Backend API server for the GUI
├── cloned-site/             # Default output directory for cloned sites
├── design-elements/         # Output directory for design analysis
├── website-cloner-gui/      # React frontend for the GUI
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   └── build/               # Production build
├── run-scraper.bat/.sh      # Scripts to run the scraper (Windows/Unix)
└── start-gui.bat/.sh        # Scripts to start the GUI (Windows/Unix)
```

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

## Troubleshooting

- **Port conflicts**: If port 3000 or 3001 is already in use, the server will try the next available port
- **CORS issues**: When running locally, make sure both backend and frontend are running
- **Missing assets**: Some websites may block scraping; check console output for errors
- **Large websites**: For very large sites, consider using a smaller depth value (e.g., `--depth=1`)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
