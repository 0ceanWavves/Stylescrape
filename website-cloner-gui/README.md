# Website Scraper GUI

A modern GUI for the website scraping tool. This application allows you to clone websites for local analysis, including HTML, CSS, JavaScript, and other assets.

## Features

- Clean, modern user interface built with React and Material UI
- Real-time progress tracking
- Detection of libraries and technologies used on the target website
- Custom cloning options (assets, libraries)
- Detailed cloning logs

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later recommended)

### Installation

1. Install dependencies for the backend server:
   ```bash
   cd ..  # Navigate to the project root
   npm install
   ```

2. Install dependencies for the frontend GUI:
   ```bash
   cd website-cloner-gui
   npm install
   ```

### Running the Application

#### Using the Startup Scripts

**Windows:**
Simply double-click the `start-gui.bat` file in the root directory.

**Linux/Mac:**
```bash
chmod +x start-gui.sh  # Make the script executable (only needed once)
./start-gui.sh
```

#### Manual Start

If you prefer to start the servers manually:

1. Start the backend server:
   ```bash
   # From the project root
   node server.js
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd website-cloner-gui
   npm start
   ```

The frontend will automatically open in your default browser at [http://localhost:3000](http://localhost:3000).

## How to Use

1. Enter the URL of the website you want to clone (e.g., `example.com` or `https://example.com`)
2. Select your desired options:
   - **Clone Assets**: Download images, CSS, and JavaScript files
   - **Extract Libraries**: Identify libraries and technologies used on the website
3. Click the "Clone Website" button
4. Watch the real-time progress as the website is cloned
5. When complete, you'll see:
   - A success message
   - A list of detected libraries (if any)
   - A log of the cloning process

## Output

The cloned website will be saved to the `cloned-site` directory in the project root.

## Troubleshooting

- **Connection Error**: Make sure the backend server is running on port 3001
- **Port Conflict**: If port 3001 is already in use, the server will try port 3002
- **Cloning Fails**: Some websites may block scraping; try with different websites

## License

This project is licensed under the MIT License - see the LICENSE file for details. 