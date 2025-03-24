# Netlify Deployment Guide for StyleScrape

This guide walks you through the process of deploying the StyleScrape website cloner GUI to Netlify.

## Prerequisites

1. A GitHub repository with your StyleScrape code
2. A Netlify account (sign up at [netlify.com](https://netlify.com) if you don't have one)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository includes:
- All necessary code files
- The README.md with proper documentation
- The package.json files with all dependencies
- Your custom output path implementation

### 2. Build Configuration

Create a `netlify.toml` file in the root of your project with the following content:

```toml
[build]
  base = "website-cloner-gui/"
  publish = "build/"
  command = "npm install && npm run build"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Deploy to Netlify

#### Option 1: Netlify GUI

1. Log in to your Netlify account
2. Click the "New site from Git" button
3. Select GitHub as your Git provider
4. Authorize Netlify to access your repositories
5. Select your StyleScrape repository
6. Configure the deployment settings:
   - Build command: `cd website-cloner-gui && npm install && npm run build`
   - Publish directory: `website-cloner-gui/build`
7. Click "Deploy site"

#### Option 2: Netlify CLI

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```bash
   netlify login
   ```

3. Initialize and deploy your site:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### 4. Configure the Server

For the website cloner to work properly when deployed on Netlify, you'll need a backend server. There are two options:

#### Option A: Serverless Functions

Convert your Node.js server to Netlify Functions:

1. Create a `/netlify/functions` directory in your project root
2. Create a clone function that handles the cloning requests
3. Update your frontend code to call the function endpoint

#### Option B: Separate Backend

Deploy your server.js separately:

1. Deploy the frontend to Netlify
2. Deploy the backend to a service like Heroku, Render, or Railway
3. Update the frontend API URL to point to your deployed backend
4. Configure CORS on the backend to allow requests from your Netlify domain

### 5. Environment Variables

Set any necessary environment variables in the Netlify dashboard:
1. Go to Site settings > Build & deploy > Environment variables
2. Add variables like `API_URL` if you're using a separate backend

## Important Notes

1. **Limitations**: Browser-based cloning has limitations compared to running locally
2. **Security**: Ensure you implement proper validation and rate limiting
3. **API Keys**: Never expose sensitive API keys in your frontend code
4. **CORS**: If using a separate backend, ensure CORS is configured correctly

## Testing Your Deployment

After deploying:

1. Visit your Netlify site URL (https://your-site-name.netlify.app)
2. Test the cloning functionality with a simple website
3. Verify that assets are downloaded correctly
4. Check that the output path selection works as expected

## Troubleshooting

- **Build Errors**: Check Netlify's build logs for details
- **API Connection Issues**: Verify the API URL is correct and accessible
- **CORS Problems**: Ensure your backend allows requests from your Netlify domain
- **Missing Dependencies**: Check that all required packages are in package.json 