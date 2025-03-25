/**
 * Logger utility for the StyleScrape application
 * Provides standardized logging and error reporting
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Default config
const config = {
  enableConsoleLogging: true,
  enableServerLogging: true,
  logLevel: LogLevel.INFO,
  serverLogEndpoint: '/.netlify/functions/log-error'
};

/**
 * Format log entry with timestamp and level
 */
const formatLogEntry = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  return `[${level}] ${timestamp} - ${message}`;
};

/**
 * Log message to console
 */
const logToConsole = (level: LogLevel, message: string, data?: any): void => {
  if (!config.enableConsoleLogging) return;
  
  const formattedMessage = formatLogEntry(level, message);
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, data || '');
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, data || '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, data || '');
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, data || '');
      break;
  }
};

/**
 * Log error to server
 */
const logToServer = async (
  level: LogLevel, 
  message: string, 
  data?: any, 
  error?: Error
): Promise<void> => {
  if (!config.enableServerLogging) return;
  if (level !== LogLevel.ERROR) return; // Only send errors to server
  
  try {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      additionalInfo: {
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        language: navigator.language,
      }
    };
    
    await fetch(config.serverLogEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'omit',
    });
  } catch (e) {
    // Fallback to console if server logging fails
    console.error('Failed to send log to server:', e);
  }
};

/**
 * Logger object with different log level methods
 */
export const logger = {
  debug: (message: string, data?: any): void => {
    if (config.logLevel === LogLevel.DEBUG) {
      logToConsole(LogLevel.DEBUG, message, data);
    }
  },
  
  info: (message: string, data?: any): void => {
    if (
      config.logLevel === LogLevel.DEBUG || 
      config.logLevel === LogLevel.INFO
    ) {
      logToConsole(LogLevel.INFO, message, data);
    }
  },
  
  warn: (message: string, data?: any): void => {
    if (
      config.logLevel === LogLevel.DEBUG || 
      config.logLevel === LogLevel.INFO || 
      config.logLevel === LogLevel.WARN
    ) {
      logToConsole(LogLevel.WARN, message, data);
    }
  },
  
  error: (message: string, error?: Error, data?: any): void => {
    logToConsole(LogLevel.ERROR, message, { error, data });
    logToServer(LogLevel.ERROR, message, data, error);
  },
  
  /**
   * Log API request information
   */
  logApiRequest: (url: string, method: string, body?: any): void => {
    logger.debug(`API Request: ${method} ${url}`, body);
  },
  
  /**
   * Log API response information
   */
  logApiResponse: (url: string, status: number, data?: any): void => {
    if (status >= 400) {
      logger.error(`API Error Response: ${url} (${status})`, undefined, data);
    } else {
      logger.debug(`API Response: ${url} (${status})`, data);
    }
  },
  
  /**
   * Configure logger settings
   */
  configure: (options: Partial<typeof config>): void => {
    Object.assign(config, options);
  }
};

/**
 * Set up global error handler
 */
export const setupGlobalErrorHandling = (): void => {
  const originalConsoleError = console.error;
  
  // Override console.error to capture React errors
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    
    // Check if this is a React error
    const errorString = args.join(' ');
    if (
      errorString.includes('React') || 
      errorString.includes('Error:') || 
      errorString.includes('Exception')
    ) {
      logToServer(LogLevel.ERROR, 'Unhandled console error', { args });
    }
  };
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', event.reason, {
      promise: event.promise,
      message: event.reason?.message || 'Unknown error'
    });
  });
  
  // Capture global errors
  window.addEventListener('error', (event) => {
    logger.error('Unhandled Global Error', {
      name: 'WindowError',
      message: event.message,
      stack: event.error?.stack
    }, {
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
    
    // Don't prevent default error handling
    return false;
  });
};

export default logger; 