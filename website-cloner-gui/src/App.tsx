import React, { useState } from 'react';
import ClonerForm from './components/ClonerForm';
import CloneProgress from './components/CloneProgress';
import LibraryList from './components/LibraryList';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';

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
      // In production with Netlify, use the direct function endpoint
      // In development, use the specified API URL or localhost:3002
      let apiUrl = '';
      
      if (process.env.NODE_ENV === 'production') {
        // In production, use the direct function endpoint
        apiUrl = '/.netlify/functions/server';
      } else {
        // In development, use the API URL from env or default
        apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      }
      
      console.log('Using API URL:', apiUrl);
      
      // Use direct /clone endpoint
      const fetchUrl = `${apiUrl}/clone`;
      
      // Log the request being sent
      console.log('Sending request to:', fetchUrl, {
        url,
        ...options
      });
      
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Enable credentials in development but not in production
        credentials: process.env.NODE_ENV === 'production' ? 'omit' : 'include',
        body: JSON.stringify({ url, ...options }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Cloning failed';
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
        } catch (e) {
          // If the response is not JSON, use the status text
          console.error('Error parsing error response:', e);
          errorMessage = `Cloning failed: ${response.statusText || response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Log that we're parsing the response
      console.log('Parsing response...');
      const data = await response.json();
      console.log('Response data:', data);

      // Update progress from response
      if (data.steps && Array.isArray(data.steps)) {
        setProgress(data.steps);
      } else if (data.progress && Array.isArray(data.progress)) {
        setProgress(data.progress);
      }
      
      // Update libraries if available
      if (data.libraries && Array.isArray(data.libraries)) {
        setLibraries(data.libraries);
      }

      // Set success message
      setSuccess(data.message || `Website cloned successfully! Saved to: ${options.outputPath}`);
      
    } catch (err: any) {
      console.error('Cloning error:', err);
      setError(err.message || 'An unknown error occurred during the cloning process');
    } finally {
      setCloning(false);
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