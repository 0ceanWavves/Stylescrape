const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

/**
 * Clone a website and extract its assets and libraries
 * @param {string} url - URL of the website to clone
 * @param {Object} options - Cloning options
 * @param {boolean} options.assets - Whether to clone assets
 * @param {boolean} options.extract - Whether to extract libraries
 */
async function cloneWebsite(url, options) {
    try {
        // Simulate progress
        console.log(JSON.stringify({ progress: ["Fetching HTML"] }));
        
        // Fetch HTML
        const response = await axios.get(url);
        const html = response.data;

        // Use jsdom to parse HTML
        const dom = new JSDOM(html, { url });
        const document = dom.window.document;
        
        // Extract title
        const title = document.title;
        
        // Extract assets (if requested)
        let assets = [];
        if (options.assets) {
            console.log(JSON.stringify({ progress: ["Fetching HTML", "Downloading Assets"] }));
            
            // Extract images
            const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
            assets = [...assets, ...images];
            
            // Extract stylesheets
            const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href);
            assets = [...assets, ...stylesheets];
            
            // Extract scripts
            const scripts = Array.from(document.querySelectorAll('script[src]')).map(script => script.src);
            assets = [...assets, ...scripts];
        }
        
        // Extract libraries (if requested)
        let libraries = [];
        if (options.extract) {
            console.log(JSON.stringify({ progress: ["Fetching HTML", "Downloading Assets", "Analyzing Libraries"] }));
            
            // Simple library detection based on script sources and global variables
            const scriptSrcs = Array.from(document.querySelectorAll('script[src]')).map(script => script.src.toLowerCase());
            
            // Detect common libraries
            if (scriptSrcs.some(src => src.includes('jquery'))) libraries.push('jQuery');
            if (scriptSrcs.some(src => src.includes('react'))) libraries.push('React');
            if (scriptSrcs.some(src => src.includes('angular'))) libraries.push('Angular');
            if (scriptSrcs.some(src => src.includes('vue'))) libraries.push('Vue.js');
            if (scriptSrcs.some(src => src.includes('bootstrap'))) libraries.push('Bootstrap');
            if (scriptSrcs.some(src => src.includes('tailwind'))) libraries.push('Tailwind CSS');
            if (scriptSrcs.some(src => src.includes('material'))) libraries.push('Material UI');
            if (scriptSrcs.some(src => src.includes('axios'))) libraries.push('Axios');
            if (scriptSrcs.some(src => src.includes('lodash'))) libraries.push('Lodash');
            if (html.includes('font-awesome')) libraries.push('Font Awesome');

            // If no libraries detected, add a placeholder
            if (libraries.length === 0) {
                libraries.push('No common libraries detected');
            }
        }
        
        // Output the results as JSON
        const result = {
            title,
            url,
            assets: assets.slice(0, 10), // Limit to first 10 assets for brevity
            libraries,
            progress: options.extract ? 
                ["Fetching HTML", "Downloading Assets", "Analyzing Libraries"] :
                (options.assets ? ["Fetching HTML", "Downloading Assets"] : ["Fetching HTML"])
        };
        
        console.log(JSON.stringify(result));
        
    } catch (error) {
        console.error(error);
        console.log(JSON.stringify({ error: error.message }));
    }
}

// Run the function if URL is provided via command line
if (argv.url) {
    cloneWebsite(argv.url, { assets: !!argv.assets, extract: !!argv.extract });
} else {
    console.log(JSON.stringify({ error: 'Please provide a URL using --url' }));
} 