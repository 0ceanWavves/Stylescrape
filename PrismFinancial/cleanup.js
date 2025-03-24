const fs = require('fs');
const path = require('path');

// Files to delete
const filesToDelete = [
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json'
];

// Directories to delete if they exist
const dirsToDelete = [
  'src',
  'node_modules',
  'public',
  '.next'
];

// Delete individual files
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${file}`);
  }
});

// Delete directories
dirsToDelete.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rm(dirPath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error(`Error deleting ${dir}: ${err.message}`);
        } else {
          console.log(`Deleted directory: ${dir}`);
        }
      });
    } catch (error) {
      console.error(`Could not delete ${dir}: ${error.message}`);
    }
  }
});

console.log('Cleanup completed. The project is now ready for the website cloner tool.');
console.log('Run "npm install" to install dependencies, then "npm start" to run the cloner.');
