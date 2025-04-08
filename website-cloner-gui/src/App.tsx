import React, { useState, useEffect } from 'react';
import ClonerForm from './components/ClonerForm';
import CloneProgress from './components/CloneProgress';
import LibraryList from './components/LibraryList';
import { Box, Typography, Alert, CircularProgress, Button, LinearProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AnalyticsIcon from '@mui/icons-material/Analytics';
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
  const [progressPercent, setProgressPercent] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<Record<string, any> | null>(null);

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

  const handleClone = async (url: string, options: { 
    cloneAssets: boolean; 
    extractLibraries: boolean; 
    outputPath: string;
    downloadZip: boolean;
  }) => {
    setCloning(true);
    setProgress([]);
    setLibraries([]);
    setError(null);
    setSuccess(null);
    setProgressPercent(0);
    setDownloadUrl(null);
    setTechnicalAnalysis(null);

    // Setup progress tracking
    const progressInterval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 90) return 90; // Cap at 90% until we get real completion
        return prev + 5;
      });
    }, 1000);

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
        apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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

      // Set download URL if available
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        logger.debug('Download URL available', { url: data.downloadUrl });
      }

      // Set technical analysis if available
      if (data.technicalAnalysis) {
        setTechnicalAnalysis(data.technicalAnalysis);
        logger.debug('Technical analysis available', data.technicalAnalysis);
      }

      // Set success message
      const successMessage = data.message || `Website cloned successfully! Saved to: ${options.outputPath}`;
      setSuccess(successMessage);
      logger.info('Cloning completed successfully', { message: successMessage });
      
      // If download option is enabled and no download URL, try to trigger the download automatically
      if (options.downloadZip && !data.downloadUrl && process.env.NODE_ENV === 'production') {
        // In production, trigger download via the download function
        const domain = new URL(processedUrl).hostname;
        initiateDownload(domain);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred during the cloning process';
      logger.error('Cloning process failed', err as Error, { url, options });
      setError(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setProgressPercent(100);
      setCloning(false);
      logger.debug('Cloning process state reset', { cloning: false });
    }
  };

  const initiateDownload = async (domain: string) => {
    try {
      let downloadEndpoint = '';
      
      if (process.env.NODE_ENV === 'production') {
        // Include technical analysis in the download if available
        let analysisParam = '';
        if (technicalAnalysis) {
          analysisParam = `&analysis=${encodeURIComponent(JSON.stringify(technicalAnalysis))}`;
        }
        downloadEndpoint = `/.netlify/functions/download?domain=${domain}${analysisParam}`;
      } else {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        // Include technical analysis in the download if available
        let analysisParam = '';
        if (technicalAnalysis) {
          analysisParam = `&analysis=${encodeURIComponent(JSON.stringify(technicalAnalysis))}`;
        }
        downloadEndpoint = `${apiUrl}/api/download?domain=${domain}${analysisParam}`;
      }
      
      logger.info('Initiating file download', { 
        endpoint: downloadEndpoint,
        hasAnalysis: !!technicalAnalysis
      });
      
      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = downloadEndpoint;
      link.download = `${domain}-clone.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logger.info('Download initiated successfully');
    } catch (err) {
      logger.error('Failed to initiate download', err as Error);
      setError('Failed to initiate download. Please try again or check console for details.');
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
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progressPercent} />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              {progressPercent}% Complete
            </Typography>
          </Box>
        </Box>
      )}
      
      {cloning && progress.length > 0 && <CloneProgress steps={progress} />}
      
      {!cloning && libraries.length > 0 && <LibraryList libraries={libraries} technicalAnalysis={technicalAnalysis} />}
      
      {!cloning && downloadUrl && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            size="large"
            onClick={() => window.location.href = downloadUrl}
            sx={{ px: 4, py: 1 }}
          >
            Download Complete Package
          </Button>
        </Box>
      )}
      
      {!cloning && !downloadUrl && progress.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="contained"
            color="primary" 
            startIcon={<DownloadIcon />}
            size="large"
            onClick={() => {
              // Take the domain from success message or use dummy domain
              const domainMatch = success?.match(/https?:\/\/([^\/]+)/);
              const domain = domainMatch ? domainMatch[1] : 'download';
              if (domain) initiateDownload(domain);
            }}
            sx={{ px: 4, py: 1 }}
          >
            Download Complete Package
          </Button>
        </Box>
      )}
      
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