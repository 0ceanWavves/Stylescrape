const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Design Extractor Tool
 * 
 * This script analyzes a cloned website and extracts its design elements into a comprehensive report.
 * It works best when run after using the website-cloner.js tool.
 */

// Configuration - replace with command line args if needed
const clonedSitesDir = path.join(__dirname, 'cloned-sites');
const designReportsDir = path.join(__dirname, 'design-reports');

class DesignExtractor {
  constructor(siteDir, outputDir) {
    this.siteDir = siteDir;
    this.outputDir = outputDir;
    this.cssDir = path.join(this.outputDir, 'css');
    this.imagesDir = path.join(this.outputDir, 'images');
    
    // Ensure directories exist
    this.ensureDirectoryExists(this.outputDir);
    this.ensureDirectoryExists(this.cssDir);
    this.ensureDirectoryExists(this.imagesDir);
    
    // Color extraction patterns
    this.colorPatterns = [
      /#[0-9a-f]{3,8}\b/gi,                         // Hex colors
      /rgba?\([\d\s,.]+\)/gi,                        // RGB and RGBA
      /hsla?\([\d\s%,.]+\)/gi,                       // HSL and HSLA
      /var\(--[a-zA-Z0-9-_]+\)/g,                    // CSS variables
      /(background|color|border|fill|stroke):\s*([^;:]+)/gi // Named colors
    ];
    
    // Store extracted design elements
    this.colors = new Set();
    this.fontFamilies = new Set();
    this.components = {
      buttons: [],
      cards: [],
      inputs: [],
      alerts: []
    };
  }
  
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  async extract() {
    console.log(`Extracting design elements from ${this.siteDir}...`);
    
    // Extract CSS
    await this.extractCSS();
    
    // Extract HTML components
    await this.extractComponents();
    
    // Create design report
    await this.createDesignReport();
    
    console.log(`Design extraction complete! Report saved to ${this.outputDir}`);
  }
  
  async extractCSS() {
    try {
      // Find all CSS files in the cloned site
      const cssFiles = [];
      
      const findCSS = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findCSS(fullPath);
          } else if (entry.name.endsWith('.css')) {
            cssFiles.push(fullPath);
          }
        }
      };
      
      // Start recursive search
      findCSS(this.siteDir);
      
      // Process CSS files
      let allCSS = '';
      
      cssFiles.forEach(file => {
        try {
          const css = fs.readFileSync(file, 'utf8');
          allCSS += `/* From ${path.relative(this.siteDir, file)} */\n${css}\n\n`;
          
          // Extract colors
          this.extractColors(css);
          
          // Extract font families
          this.extractFontFamilies(css);
          
        } catch (error) {
          console.error(`Error reading CSS file ${file}:`, error.message);
        }
      });
      
      // Save combined CSS
      fs.writeFileSync(path.join(this.cssDir, 'all-styles.css'), allCSS);
      console.log(`Extracted CSS to ${path.join(this.cssDir, 'all-styles.css')}`);
      
      // Create a simplified essential CSS file
      this.createEssentialCSS(allCSS);
      
    } catch (error) {
      console.error('Error extracting CSS:', error.message);
    }
  }
  
  createEssentialCSS(allCSS) {
    // Extremely simplified approach - just extract key design elements
    let essentialCSS = '/* Essential Design Elements */\n\n';
    
    // Add color variables section
    essentialCSS += '/* Colors */\n:root {\n';
    Array.from(this.colors).forEach((color, index) => {
      essentialCSS += `  --color-${index + 1}: ${color};\n`;
    });
    essentialCSS += '}\n\n';
    
    // Add typography section
    essentialCSS += '/* Typography */\n';
    Array.from(this.fontFamilies).forEach(font => {
      essentialCSS += `/* Font Family: ${font} */\n`;
    });
    
    // Save essential CSS
    fs.writeFileSync(path.join(this.cssDir, 'essential-styles.css'), essentialCSS);
    console.log(`Created essential CSS at ${path.join(this.cssDir, 'essential-styles.css')}`);
  }
  
  extractColors(css) {
    // Find all color values in the CSS
    this.colorPatterns.forEach(pattern => {
      const matches = css.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // For property:value matches, extract just the value
          if (match.includes(':')) {
            const parts = match.split(':');
            if (parts.length > 1) {
              const colorValue = parts[1].trim().replace(';', '');
              if (this.isValidColor(colorValue)) {
                this.colors.add(colorValue);
              }
            }
          } else if (this.isValidColor(match)) {
            this.colors.add(match);
          }
        });
      }
    });
  }
  
  isValidColor(color) {
    // Quick filtering of obvious non-colors
    if (!color) return false;
    
    // Skip CSS variables for now
    if (color.includes('var(')) return false;
    
    // Skip values with expressions
    if (color.includes('calc(') || color.includes('url(')) return false;
    
    // Skip values that are just numbers
    if (/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw)?$/.test(color)) return false;
    
    return true;
  }
  
  extractFontFamilies(css) {
    // Extract font-family declarations
    const fontFamilyRegex = /font-family:\s*([^;]+)/gi;
    let match;
    
    while ((match = fontFamilyRegex.exec(css)) !== null) {
      if (match[1]) {
        const fontFamily = match[1].trim();
        this.fontFamilies.add(fontFamily);
      }
    }
  }
  
  async extractComponents() {
    try {
      // Find HTML files
      const htmlFiles = [];
      
      const findHTML = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findHTML(fullPath);
          } else if (entry.name.endsWith('.html')) {
            htmlFiles.push(fullPath);
          }
        }
      };
      
      findHTML(this.siteDir);
      
      // Process HTML files to extract components
      for (const file of htmlFiles) {
        try {
          const html = fs.readFileSync(file, 'utf8');
          const dom = new JSDOM(html);
          const { document } = dom.window;
          
          // Extract buttons
          this.extractButtons(document);
          
          // Extract cards/containers
          this.extractCards(document);
          
          // Extract form elements
          this.extractFormElements(document);
          
          // Extract alerts/notifications
          this.extractAlerts(document);
          
        } catch (error) {
          console.error(`Error processing HTML file ${file}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Error extracting components:', error.message);
    }
  }
  
  extractButtons(document) {
    // Get all buttons and anchor tags that look like buttons
    const buttons = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('a.btn, a.button, a[role="button"]'),
      ...document.querySelectorAll('a[class*="btn"], a[class*="button"]')
    ];
    
    buttons.forEach(button => {
      const className = button.getAttribute('class') || '';
      const style = button.getAttribute('style') || '';
      
      // Only add if we don't already have a similar button
      const buttonText = button.textContent.trim();
      const buttonHtml = button.outerHTML;
      
      // Simple deduplication by checking button class names
      if (!this.components.buttons.some(b => b.className === className)) {
        this.components.buttons.push({
          element: button.tagName.toLowerCase(),
          className,
          style,
          text: buttonText,
          html: buttonHtml
        });
      }
    });
  }
  
  extractCards(document) {
    // Look for common card patterns
    const cardSelectors = [
      '.card', '[class*="card"]',
      '.box', '[class*="box"]',
      '.container', '[class*="container"]',
      '.panel', '[class*="panel"]',
      'div[class*="shadow"]'
    ];
    
    const cards = document.querySelectorAll(cardSelectors.join(','));
    
    cards.forEach(card => {
      const className = card.getAttribute('class') || '';
      const style = card.getAttribute('style') || '';
      
      // Skip if too large or small
      const html = card.outerHTML;
      if (html.length > 1000 || html.length < 50) return;
      
      // Simple deduplication by class name
      if (!this.components.cards.some(c => c.className === className)) {
        this.components.cards.push({
          className,
          style,
          html: html
        });
      }
    });
  }
  
  extractFormElements(document) {
    // Get input elements
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const type = input.getAttribute('type') || input.tagName.toLowerCase();
      const className = input.getAttribute('class') || '';
      const style = input.getAttribute('style') || '';
      
      // Skip hidden inputs
      if (type === 'hidden') return;
      
      // Simple deduplication
      if (!this.components.inputs.some(i => 
          i.type === type && i.className === className)) {
        this.components.inputs.push({
          type,
          className,
          style,
          html: input.outerHTML
        });
      }
    });
  }
  
  extractAlerts(document) {
    // Look for alert/notification patterns
    const alertSelectors = [
      '.alert', '[class*="alert"]',
      '.notification', '[class*="notification"]',
      '.message', '[class*="message"]',
      '.toast', '[class*="toast"]',
      '[role="alert"]'
    ];
    
    const alerts = document.querySelectorAll(alertSelectors.join(','));
    
    alerts.forEach(alert => {
      const className = alert.getAttribute('class') || '';
      const html = alert.outerHTML;
      
      // Skip if too large
      if (html.length > 1000) return;
      
      // Simple deduplication
      if (!this.components.alerts.some(a => a.className === className)) {
        this.components.alerts.push({
          className,
          html
        });
      }
    });
  }
  
  async createDesignReport() {
    try {
      // Create a report HTML
      const reportDom = new JSDOM('<!DOCTYPE html><html><head><title>Design System Report</title></head><body></body></html>');
      const document = reportDom.window.document;
      
      // Add stylesheet
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --report-bg: #f8fafc;
          --card-bg: white;
          --text-color: #334155;
          --heading-color: #0f172a;
          --border-color: #e2e8f0;
          --primary-color: #3b82f6;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color: var(--text-color);
          background: var(--report-bg);
          padding: 2rem;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        header {
          margin-bottom: 3rem;
          text-align: center;
        }
        
        h1 {
          font-size: 2.5rem;
          color: var(--heading-color);
          margin-bottom: 1rem;
        }
        
        h2 {
          font-size: 1.8rem;
          color: var(--heading-color);
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        h3 {
          font-size: 1.4rem;
          color: var(--heading-color);
          margin: 1.5rem 0 1rem;
        }
        
        p {
          margin-bottom: 1rem;
        }
        
        .card {
          background: var(--card-bg);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .color-palette {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .color-swatch {
          width: 100px;
          height: 100px;
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0.5rem;
          font-size: 0.75rem;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .color-swatch::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(transparent, rgba(0,0,0,0.3));
          pointer-events: none;
        }
        
        .component-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .component-card {
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .component-preview {
          padding: 1.5rem;
          background: white;
          border-bottom: 1px solid var(--border-color);
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .component-code {
          padding: 1rem;
          background: #f1f5f9;
          font-family: monospace;
          font-size: 0.85rem;
          overflow: auto;
          max-height: 200px;
        }
        
        .font-item {
          margin-bottom: 1.5rem;
        }
        
        .font-example {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .font-details {
          font-size: 0.875rem;
          color: #64748b;
        }
        
        code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
      `;
      document.head.appendChild(style);
      
      // Create container
      const container = document.createElement('div');
      container.className = 'container';
      document.body.appendChild(container);
      
      // Add header
      const header = document.createElement('header');
      header.innerHTML = `
        <h1>Design System Report</h1>
        <p>Extracted from cloned website</p>
      `;
      container.appendChild(header);
      
      // Create color palette section
      this.createColorPaletteSection(document, container);
      
      // Create typography section
      this.createTypographySection(document, container);
      
      // Create components section
      this.createComponentsSection(document, container);
      
      // Save the report
      fs.writeFileSync(
        path.join(this.outputDir, 'design-report.html'), 
        reportDom.serialize()
      );
      
    } catch (error) {
      console.error('Error creating design report:', error.message);
    }
  }
  
  createColorPaletteSection(document, container) {
    const section = document.createElement('section');
    section.innerHTML = `<h2>Color Palette</h2>`;
    
    const colorPalette = document.createElement('div');
    colorPalette.className = 'color-palette';
    
    // Add color swatches
    Array.from(this.colors).forEach(color => {
      try {
        // Skip invalid values
        if (!this.isValidColor(color)) return;
        
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.textContent = color;
        
        colorPalette.appendChild(swatch);
      } catch (error) {
        // Skip colors that cause errors
      }
    });
    
    section.appendChild(colorPalette);
    container.appendChild(section);
  }
  
  createTypographySection(document, container) {
    const section = document.createElement('section');
    section.innerHTML = `<h2>Typography</h2>`;
    
    const fontsList = document.createElement('div');
    fontsList.className = 'card';
    
    // Add font families
    if (this.fontFamilies.size > 0) {
      Array.from(this.fontFamilies).forEach(font => {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        
        const fontExample = document.createElement('div');
        fontExample.className = 'font-example';
        fontExample.style.fontFamily = font;
        fontExample.textContent = 'The quick brown fox jumps over the lazy dog';
        
        const fontDetails = document.createElement('div');
        fontDetails.className = 'font-details';
        fontDetails.textContent = `Font Family: ${font}`;
        
        fontItem.appendChild(fontExample);
        fontItem.appendChild(fontDetails);
        fontsList.appendChild(fontItem);
      });
    } else {
      fontsList.innerHTML = `
        <p>No specific font families detected. The site likely uses system fonts.</p>
        <div class="font-item">
          <div class="font-example" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            The quick brown fox jumps over the lazy dog
          </div>
          <div class="font-details">
            Font Family: System font stack
          </div>
        </div>
      `;
    }
    
    section.appendChild(fontsList);
    
    // Add typography scale examples
    const typographyScale = document.createElement('div');
    typographyScale.className = 'card';
    typographyScale.innerHTML = `
      <h3>Typography Scale</h3>
      <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">Heading 1 (2.5rem)</div>
      <div style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">Heading 2 (2rem)</div>
      <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Heading 3 (1.5rem)</div>
      <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Heading 4 (1.25rem)</div>
      <div style="font-size: 1rem; margin-bottom: 1rem;">Paragraph text (1rem)</div>
      <div style="font-size: 0.875rem; margin-bottom: 1rem;">Small text (0.875rem)</div>
    `;
    
    section.appendChild(typographyScale);
    container.appendChild(section);
  }
  
  createComponentsSection(document, container) {
    const section = document.createElement('section');
    section.innerHTML = `<h2>UI Components</h2>`;
    
    // Add buttons
    if (this.components.buttons.length > 0) {
      const buttonsSection = document.createElement('div');
      buttonsSection.innerHTML = `<h3>Buttons</h3>`;
      
      const buttonsGrid = document.createElement('div');
      buttonsGrid.className = 'component-grid';
      
      this.components.buttons.slice(0, 6).forEach(button => {
        const componentCard = document.createElement('div');
        componentCard.className = 'component-card';
        
        const preview = document.createElement('div');
        preview.className = 'component-preview';
        preview.innerHTML = button.html;
        
        const code = document.createElement('div');
        code.className = 'component-code';
        code.textContent = button.html;
        
        componentCard.appendChild(preview);
        componentCard.appendChild(code);
        buttonsGrid.appendChild(componentCard);
      });
      
      buttonsSection.appendChild(buttonsGrid);
      section.appendChild(buttonsSection);
    }
    
    // Add cards
    if (this.components.cards.length > 0) {
      const cardsSection = document.createElement('div');
      cardsSection.innerHTML = `<h3>Cards</h3>`;
      
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'component-grid';
      
      this.components.cards.slice(0, 4).forEach(card => {
        const componentCard = document.createElement('div');
        componentCard.className = 'component-card';
        
        const preview = document.createElement('div');
        preview.className = 'component-preview';
        preview.innerHTML = card.html;
        
        const code = document.createElement('div');
        code.className = 'component-code';
        code.textContent = card.html;
        
        componentCard.appendChild(preview);
        componentCard.appendChild(code);
        cardsGrid.appendChild(componentCard);
      });
      
      cardsSection.appendChild(cardsGrid);
      section.appendChild(cardsSection);
    }
    
    // Add form elements
    if (this.components.inputs.length > 0) {
      const inputsSection = document.createElement('div');
      inputsSection.innerHTML = `<h3>Form Elements</h3>`;
      
      const inputsGrid = document.createElement('div');
      inputsGrid.className = 'component-grid';
      
      this.components.inputs.slice(0, 6).forEach(input => {
        const componentCard = document.createElement('div');
        componentCard.className = 'component-card';
        
        const preview = document.createElement('div');
        preview.className = 'component-preview';
        preview.innerHTML = input.html;
        
        const code = document.createElement('div');
        code.className = 'component-code';
        code.textContent = input.html;
        
        componentCard.appendChild(preview);
        componentCard.appendChild(code);
        inputsGrid.appendChild(componentCard);
      });
      
      inputsSection.appendChild(inputsGrid);
      section.appendChild(inputsSection);
    }
    
    // Add alerts
    if (this.components.alerts.length > 0) {
      const alertsSection = document.createElement('div');
      alertsSection.innerHTML = `<h3>Alerts & Notifications</h3>`;
      
      const alertsGrid = document.createElement('div');
      alertsGrid.className = 'component-grid';
      
      this.components.alerts.slice(0, 4).forEach(alert => {
        const componentCard = document.createElement('div');
        componentCard.className = 'component-card';
        
        const preview = document.createElement('div');
        preview.className = 'component-preview';
        preview.innerHTML = alert.html;
        
        const code = document.createElement('div');
        code.className = 'component-code';
        code.textContent = alert.html;
        
        componentCard.appendChild(preview);
        componentCard.appendChild(code);
        alertsGrid.appendChild(componentCard);
      });
      
      alertsSection.appendChild(alertsGrid);
      section.appendChild(alertsSection);
    }
    
    container.appendChild(section);
  }
}

// Process all cloned sites
async function processAllSites() {
  try {
    if (!fs.existsSync(clonedSitesDir)) {
      console.error(`The cloned sites directory ${clonedSitesDir} does not exist.`);
      console.log('Run website-cloner.js first to clone a website.');
      return;
    }
    
    const sites = fs.readdirSync(clonedSitesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (sites.length === 0) {
      console.error('No cloned sites found.');
      console.log('Run website-cloner.js first to clone a website.');
      return;
    }
    
    for (const site of sites) {
      const siteDir = path.join(clonedSitesDir, site);
      const outputDir = path.join(designReportsDir, site);
      
      const extractor = new DesignExtractor(siteDir, outputDir);
      await extractor.extract();
    }
    
  } catch (error) {
    console.error('Error processing sites:', error.message);
  }
}

// Run the design extractor
processAllSites();
