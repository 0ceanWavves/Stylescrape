# Website Ripping Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A collection of tools for cloning and analyzing websites. These tools allow you to:

1. Clone websites for offline viewing and analysis
2. Extract design elements and create a design system report
3. Generate static versions of dynamic websites
4. Serve cloned websites locally for proper rendering

## 📋 Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [Website Cloner](#website-cloner)
  - [Serving Cloned Sites](#serving-cloned-sites)
  - [Static Site Generator](#static-site-generator)
  - [Design Extractor](#design-extractor)
- [Features](#features)
- [Limitations](#limitations)
- [Ethical Usage](#ethical-usage)
- [License](#license)

## 🚀 Installation

1. Ensure you have [Node.js](https://nodejs.org/) installed (v14 or higher)
2. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/website-ripping-tools.git
   cd website-ripping-tools
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## 🔧 Usage

### Website Cloner

Clone any website for offline viewing and analysis:

```bash
npm run clone -- --url https://example.com
```

With advanced options:

```bash
npm run clone -- --url https://example.com --depth 3 --output example-site
```

#### Command Line Options

- `--url [url]`: URL of the website to clone (default: joincobalt.com)
- `--output [dir]`: Output directory name (default: website hostname)
- `--depth [number]`: Maximum depth to crawl (default: 2)
- `--no-assets`: Skip downloading assets (CSS, JS, images)
- `--help`: Show help message

### Serving Cloned Sites

For proper viewing of cloned websites (especially JavaScript-heavy sites like Next.js):

```bash
npm run serve
```

This will start a local web server serving the default cloned site at http://localhost:3000.

To specify a different cloned site:

```bash
npm run serve -- --site example.com
```

### Static Site Generator

Convert a cloned dynamic website into a simplified static version that can be viewed directly in browsers:

```bash
npm run static -- --site joincobalt.com
```

This creates a static version in the `static-sites/[site-name]` directory that can be opened directly in any browser.

### Design Extractor

Extract design elements from a cloned website to create a comprehensive design system report:

```bash
npm run extract
```

The design report includes:
- Color palettes
- Typography analysis
- UI components catalog
- Design patterns

## 📂 Folder Structure

- `cloned-sites/` - Where cloned websites are stored
- `static-sites/` - Where simplified static versions are generated
- `design-reports/` - Where design analysis reports are saved

## ✨ Features

### Website Cloner
- Downloads HTML pages with intelligent crawling
- Follows links to capture site structure
- Downloads and processes assets (CSS, JS, images)
- Handles redirects and relative links

### Local Server
- Properly serves cloned websites
- Supports dynamic JavaScript-heavy sites
- Handles path resolution

### Static Generator
- Converts dynamic sites to static HTML
- Simplifies complex structures
- Preserves visual design elements
- Makes sites viewable without a server

### Design Extractor
- Extracts color palettes
- Identifies typography styles
- Catalogs UI components
- Creates visual design system report

## ⚠️ Limitations

- JavaScript-heavy sites might have limited functionality in static versions
- Sites with authentication will only show public pages
- Very complex sites might not clone completely
- Web application functionality (forms, APIs) won't work

## 🔒 Ethical Usage

These tools are intended for:
- Web design research
- Learning web development techniques
- Design inspiration
- Accessibility studies
- Personal offline viewing

Always respect website terms of service and copyright restrictions.

## 📄 License

MIT License
