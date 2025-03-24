const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const clonedSiteDir = path.join(__dirname, 'cloned-site');
const designDir = path.join(__dirname, 'design-elements');

// Create output directory
if (!fs.existsSync(designDir)) {
  fs.mkdirSync(designDir, { recursive: true });
}

// Create CSS directory
const cssDir = path.join(designDir, 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

// Extract CSS from the cloned site
function extractCSS() {
  try {
    // Find all CSS files in the cloned site
    const cssFiles = [];
    
    function findCSS(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findCSS(fullPath);
        } else if (entry.name.endsWith('.css')) {
          cssFiles.push(fullPath);
        }
      }
    }
    
    findCSS(clonedSiteDir);
    
    // Create a comprehensive CSS file
    let allCSS = '';
    
    cssFiles.forEach(file => {
      const css = fs.readFileSync(file, 'utf8');
      allCSS += `/* From ${path.relative(clonedSiteDir, file)} */\n${css}\n\n`;
    });
    
    fs.writeFileSync(path.join(cssDir, 'all-styles.css'), allCSS);
    console.log(`Extracted CSS to ${path.join(cssDir, 'all-styles.css')}`);
  } catch (error) {
    console.error('Error extracting CSS:', error.message);
  }
}

// Create an HTML report with design elements
function createDesignReport() {
  try {
    const mainHtmlPath = path.join(clonedSiteDir, 'index.html');
    if (!fs.existsSync(mainHtmlPath)) {
      throw new Error('Main index.html not found in cloned site');
    }
    
    const html = fs.readFileSync(mainHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;
    
    // Create a report HTML
    const reportDom = new JSDOM('<!DOCTYPE html><html><head><title>Design Elements - Cobalt Clone</title></head><body></body></html>');
    const reportDoc = reportDom.window.document;
    
    // Add styles
    const style = reportDoc.createElement('style');
    style.textContent = `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; padding: 2rem; max-width: 1200px; margin: 0 auto; }
      .container { display: flex; flex-wrap: wrap; gap: 2rem; }
      .color-palette { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
      .color-swatch { width: 100px; height: 100px; border-radius: 8px; display: flex; flex-direction: column; justify-content: flex-end; padding: 8px; color: white; font-size: 12px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
      .element-container { border: 1px solid #eaeaea; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; background: white; }
      .element-title { font-size: 1.2rem; font-weight: bold; margin: 0 0 1rem 0; }
      .element-preview { border: 1px dashed #eaeaea; padding: 1rem; margin-bottom: 1rem; }
      h1 { font-size: 2.5rem; margin-bottom: 1.5rem; }
      h2 { font-size: 1.8rem; margin: 2rem 0 1rem; }
      code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9rem; }
    `;
    reportDoc.head.appendChild(style);
    
    // Create the report content
    const header = reportDoc.createElement('header');
    header.innerHTML = `
      <h1>Design Analysis: Cobalt Financial Platform</h1>
      <p>This report extracts the key design elements from the Cobalt website to help you understand its visual language and components.</p>
    `;
    reportDoc.body.appendChild(header);
    
    // Color Palette section
    const colorSection = reportDoc.createElement('section');
    colorSection.innerHTML = `
      <h2>Color Palette</h2>
      <div class="color-palette">
        <div class="color-swatch" style="background-color: #1C64F2">#1C64F2 - Primary Blue</div>
        <div class="color-swatch" style="background-color: #111827">#111827 - Dark Navy</div>
        <div class="color-swatch" style="background-color: #374151">#374151 - Dark Gray</div>
        <div class="color-swatch" style="background-color: #9CA3AF">#9CA3AF - Medium Gray</div>
        <div class="color-swatch" style="background-color: #F3F4F6; color: #111827">#F3F4F6 - Light Gray</div>
        <div class="color-swatch" style="background-color: #10B981">#10B981 - Success Green</div>
        <div class="color-swatch" style="background-color: #F59E0B">#F59E0B - Warning Yellow</div>
        <div class="color-swatch" style="background-color: #EF4444">#EF4444 - Error Red</div>
      </div>
      <p>Note: These colors are approximated from the site's visual appearance. For exact values, refer to the extracted CSS files.</p>
    `;
    reportDoc.body.appendChild(colorSection);
    
    // Typography section
    const typoSection = reportDoc.createElement('section');
    typoSection.innerHTML = `
      <h2>Typography</h2>
      <div class="element-container">
        <p>The site uses a modern sans-serif font stack, likely <code>Inter</code> or similar.</p>
        <div class="element-preview">
          <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">Heading 1</h1>
          <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Heading 2</h2>
          <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Heading 3</h3>
          <p style="font-size: 1rem; margin-bottom: 1rem;">Regular paragraph text. The site uses a clean, readable font with good spacing for optimal readability.</p>
          <p style="font-size: 0.875rem;">Smaller text used for secondary information.</p>
        </div>
      </div>
    `;
    reportDoc.body.appendChild(typoSection);
    
    // UI Components section
    const componentsSection = reportDoc.createElement('section');
    componentsSection.innerHTML = `
      <h2>UI Components</h2>
      
      <div class="element-container">
        <div class="element-title">Buttons</div>
        <div class="element-preview">
          <button style="background-color: #1C64F2; color: white; font-weight: 500; padding: 0.5rem 1rem; border-radius: 9999px; border: none; margin-right: 1rem;">Primary Button</button>
          <button style="background-color: white; color: #374151; font-weight: 500; padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid #D1D5DB; margin-right: 1rem;">Secondary Button</button>
          <button style="color: #1C64F2; font-weight: 500; padding: 0.5rem 0; border: none; background: transparent;">Text Link</button>
        </div>
      </div>
      
      <div class="element-container">
        <div class="element-title">Cards</div>
        <div class="element-preview">
          <div style="background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; max-width: 300px;">
            <div style="background: #F3F4F6; width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px; height: 24px; color: #1C64F2;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Feature Title</h3>
            <p style="color: #6B7280; margin-bottom: 0;">Description of the feature goes here. Keep it short and to the point.</p>
          </div>
        </div>
      </div>
      
      <div class="element-container">
        <div class="element-title">Alert/Notification</div>
        <div class="element-preview">
          <div style="display: flex; background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 1rem; border-radius: 0.375rem; align-items: flex-start;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px; color: #F59E0B; margin-right: 0.75rem; flex-shrink: 0; margin-top: 0.125rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p style="font-weight: 500; margin: 0 0 0.25rem 0;">Important notification</p>
              <p style="color: #92400E; margin: 0; font-size: 0.875rem;">This is an example of an alert message that might appear in the interface.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    reportDoc.body.appendChild(componentsSection);
    
    // Layout section
    const layoutSection = reportDoc.createElement('section');
    layoutSection.innerHTML = `
      <h2>Page Layout</h2>
      <div class="element-container">
        <p>The site uses a modern, clean layout with these characteristics:</p>
        <ul>
          <li>Generous whitespace between sections</li>
          <li>Maximum content width constrained (likely around 1200px)</li>
          <li>Grid-based component layouts</li>
          <li>Strategic use of background colors to delineate sections</li>
          <li>Consistent padding and margin values</li>
        </ul>
      </div>
    `;
    reportDoc.body.appendChild(layoutSection);
    
    // Recommendation section
    const recSection = reportDoc.createElement('section');
    recSection.innerHTML = `
      <h2>Implementation Recommendations</h2>
      <div class="element-container">
        <p>Based on the analysis, the site appears to be built with:</p>
        <ul>
          <li><strong>Framework:</strong> Next.js</li>
          <li><strong>Styling:</strong> Likely Tailwind CSS with custom configurations</li>
          <li><strong>UI Components:</strong> Custom components, potentially using a headless UI library</li>
        </ul>
        <p>To recreate a similar design:</p>
        <ol>
          <li>Set up a Next.js project with Tailwind CSS</li>
          <li>Configure the color palette in the Tailwind config</li>
          <li>Create reusable components for cards, buttons, alerts, etc.</li>
          <li>Use responsive design principles similar to the original site</li>
          <li>Focus on typography and spacing to maintain the clean, professional feel</li>
        </ol>
      </div>
    `;
    reportDoc.body.appendChild(recSection);
    
    // Save the report
    fs.writeFileSync(path.join(designDir, 'design-report.html'), reportDom.serialize());
    console.log(`Created design report: ${path.join(designDir, 'design-report.html')}`);
  } catch (error) {
    console.error('Error creating design report:', error.message);
  }
}

// Run the extraction processes
extractCSS();
createDesignReport();
console.log('Design extraction complete!');
