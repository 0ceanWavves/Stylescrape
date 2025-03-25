import React, { useState, useEffect } from 'react';
import ClonerForm from './components/ClonerForm';
import CloneProgress from './components/CloneProgress';
import LibraryList from './components/LibraryList';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import logger, { setupGlobalErrorHandling } from './utils/logger';

/**
 * @component
 * @description Main application component for the website cloner GUI.
 * @returns {JSX.Element}
 */
function App() {
  const [cloning, setCloning] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [libraries, setLibraries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set up global error handling on component mount
  useEffect(() => {
    setupGlobalErrorHandling();
    logger.info('Website Cloner GUI initialized');
  }, []);

  const containerStyle = {
    fontFamily: 'Roboto, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const handleClone = async (url: string, options: { cloneAssets: boolean; extractLibraries: boolean; outputPath: string; }) => {
    setCloning(true);
    setProgress([]);
    setLibraries([]);
    setError(null);
    setSuccess(null);

    try {
      // In production with Netlify, use the dedicated function endpoint
      // In development, use the specified API URL or localhost:3002
      let apiUrl = '';
      let cloneEndpoint = '';
      
      if (process.env.NODE_ENV === 'production') {
        // In production, use the dedicated function endpoint
        cloneEndpoint = '/.netlify/functions/clone';
      } else {
        // In development, use the API URL from env or default
        apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
        cloneEndpoint = `${apiUrl}/api/clone`;
      }
      
      // Ensure URL has a protocol
      let processedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        processedUrl = 'https://' + url;
      }
      
      logger.info('Starting website clone process', { 
        url: processedUrl,
        endpoint: cloneEndpoint,
        options 
      });
      
      // Log the API request
      logger.logApiRequest(cloneEndpoint, 'POST', { 
        url: processedUrl, 
        ...options 
      });
      
      const response = await fetch(cloneEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Always omit credentials for Netlify Functions
        credentials: 'omit',
        body: JSON.stringify({ 
          url: processedUrl, 
          ...options 
        }),
      });

      logger.info('Received response from clone endpoint', { status: response.status });
      
      if (!response.ok) {
        let errorMessage = 'Cloning failed';
        try {
          const errorData = await response.json();
          logger.logApiResponse(cloneEndpoint, response.status, errorData);
          
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
        } catch (e) {
          // If the response is not JSON, use the status text
          logger.error('Error parsing error response', e as Error, { 
            status: response.status,
            statusText: response.statusText,
            url: cloneEndpoint
          });
          
          errorMessage = `Cloning failed: ${response.statusText || response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Parse the response
      let data: any;
      try {
        data = await response.json();
        logger.logApiResponse(cloneEndpoint, response.status, data);
      } catch (e) {
        logger.error('Error parsing success response', e as Error);
        throw new Error('Failed to parse server response');
      }

      // Update progress from response
      if (data.steps && Array.isArray(data.steps)) {
        setProgress(data.steps);
        logger.debug('Set progress steps', data.steps);
      } else if (data.progress && Array.isArray(data.progress)) {
        setProgress(data.progress);
        logger.debug('Set progress from progress field', data.progress);
      } else {
        logger.warn('No progress data found in response');
      }
      
      // Update libraries if available
      if (data.libraries && Array.isArray(data.libraries)) {
        setLibraries(data.libraries);
        logger.debug('Set libraries', data.libraries);
      } else {
        logger.debug('No libraries found in response');
      }

      // Set success message
      const successMessage = data.message || `Website cloned successfully! Saved to: ${options.outputPath}`;
      setSuccess(successMessage);
      logger.info('Cloning completed successfully', { message: successMessage });
      
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred during the cloning process';
      logger.error('Cloning process failed', err as Error, { url, options });
      setError(errorMessage);
    } finally {
      setCloning(false);
      logger.debug('Cloning process state reset', { cloning: false });
    }
  };

  return (
    <div style={containerStyle}>
      <Typography variant="h4" align="center" gutterBottom>
        Website Scraper Tool
      </Typography>
      
      <Typography variant="body1" align="center" paragraph>
        Enter a URL to clone a website for analysis. The tool will download the HTML, CSS, JavaScript, and assets.
      </Typography>
      
      <ClonerForm onClone={handleClone} disabled={cloning} />
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && !error && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {cloning && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">Cloning in progress...</Typography>
        </Box>
      )}
      
      {cloning && progress.length > 0 && <CloneProgress steps={progress} />}
      
      {!cloning && libraries.length > 0 && <LibraryList libraries={libraries} />}
      
      {!cloning && progress.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6">Cloning Log:</Typography>
          {progress.map((step, index) => (
            <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', my: 0.5 }}>
              {step}
            </Typography>
          ))}
        </Box>
      )}
    </div>
  );
}

export default App; 