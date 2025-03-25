import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LogLevel, logger } from './utils/logger';

// Configure logger based on environment variables
const configureLogger = () => {
  const logLevelString = process.env.REACT_APP_LOG_LEVEL || 'INFO';
  let logLevel = LogLevel.INFO;
  
  // Map string to enum
  switch (logLevelString.toUpperCase()) {
    case 'DEBUG':
      logLevel = LogLevel.DEBUG;
      break;
    case 'INFO':
      logLevel = LogLevel.INFO;
      break;
    case 'WARN':
      logLevel = LogLevel.WARN;
      break;
    case 'ERROR':
      logLevel = LogLevel.ERROR;
      break;
  }
  
  // Configure logger
  logger.configure({
    logLevel,
    enableServerLogging: process.env.NODE_ENV === 'production', // Only log to server in production
    enableConsoleLogging: true // Always log to console
  });
  
  logger.info(`Logger initialized with level: ${logLevelString}`, { 
    environment: process.env.NODE_ENV
  });
};

// Initialize logger
configureLogger();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 