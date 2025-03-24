# Website Cloner Tool

A simple tool to clone websites like joincobalt.com for local viewing and analysis.

## Setup Instructions

### Step 1: Clean up the project
First, run the cleanup script to remove any unnecessary files:

```bash
node cleanup.js
```

### Step 2: Install dependencies
Install the required packages:

```bash
npm install
```

### Step 3: Run the cloner
Start the website cloning process:

```bash
npm start
```

## Configuration

You can modify these settings in the `website-cloner.js` file:

- `targetWebsite`: The website URL you want to clone (default: "https://joincobalt.com")
- `outputDir`: Where to save the cloned website (default: "./cloned-site")
- `maxDepth`: How many levels of links to follow (default: 2)
- `downloadAssets`: Whether to download images, CSS, and JavaScript files (default: true)

## Troubleshooting

If you encounter issues:

1. **Missing dependencies**: Make sure to run `npm install` first
2. **Permission errors**: Make sure you have write permissions for the output directory
3. **Network errors**: Verify your internet connection and that the target website is accessible
4. **Memory issues**: Try reducing the `maxDepth` value if the process uses too much memory

## Limitations

- JavaScript-rendered content may not be captured properly
- Some dynamic features won't work in the cloned version
- Complex websites with authentication or personalized content may not clone correctly
