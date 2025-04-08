import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Divider, Box } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import styles from './ClonerForm.module.css';

// Interface for cloning history items
interface CloneHistoryItem {
  url: string;
  timestamp: string;
  outputPath: string;
}

/**
 * @component
 * @description Form for inputting website URL and cloning options.
 * @param {Object} props - Component props
 * @param {Function} props.onClone - Callback function to trigger cloning.
 * @param {boolean} props.disabled - Whether the form should be disabled.
 * @returns {JSX.Element}
 */
function ClonerForm({ 
    onClone, 
    disabled = false 
}: { 
    onClone: (url: string, options: { cloneAssets: boolean; extractLibraries: boolean; outputPath: string; downloadZip: boolean; }) => void; 
    disabled?: boolean;
}) {
    const [url, setUrl] = useState('');
    const [cloneAssets, setCloneAssets] = useState(true);
    const [extractLibraries, setExtractLibraries] = useState(true);
    const [downloadZip, setDownloadZip] = useState(false);
    const [cloneHistory, setCloneHistory] = useState<CloneHistoryItem[]>([]);
    
    // Set default output path to Desktop/website-clone
    const defaultPath = process.env.NODE_ENV === 'production' 
        ? '~/Desktop/website-clone' 
        : './website-clone';
    
    const [outputPath, setOutputPath] = useState(defaultPath);
    const [urlError, setUrlError] = useState('');

    // Load clone history from localStorage on component mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('cloneHistory');
            if (savedHistory) {
                setCloneHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error('Error loading clone history:', error);
        }
    }, []);

    const validateUrl = (inputUrl: string) => {
        setUrl(inputUrl);
        
        // Clear error when user is typing
        if (urlError) setUrlError('');
        
        // Don't validate empty input (to avoid showing error on initial render)
        if (!inputUrl.trim()) return;
        
        // Basic URL validation
        if (!inputUrl.includes('.')) {
            setUrlError('Please enter a valid domain (e.g., example.com)');
        }
    };

    const handleSubmit = () => {
        // Basic validation
        if (!url.trim()) {
            setUrlError('Please enter a URL');
            return;
        }

        // Add protocol if missing
        let processedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            processedUrl = 'https://' + url;
        }

        // Create domain-specific output path
        const domain = new URL(processedUrl).hostname;
        const defaultOutputPath = `${outputPath}/${domain}`;

        // Add to history
        const newHistoryItem: CloneHistoryItem = {
            url: processedUrl,
            timestamp: new Date().toISOString(),
            outputPath: defaultOutputPath
        };

        const updatedHistory = [newHistoryItem, ...cloneHistory].slice(0, 10); // Keep only last 10 items
        setCloneHistory(updatedHistory);
        
        // Save to localStorage
        try {
            localStorage.setItem('cloneHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error saving clone history:', error);
        }

        onClone(processedUrl, { 
            cloneAssets, 
            extractLibraries, 
            outputPath: defaultOutputPath,
            downloadZip
        });
    };

    const handleHistorySelect = (historyItem: CloneHistoryItem) => {
        setUrl(historyItem.url);
        setOutputPath(historyItem.outputPath.split('/').slice(0, -1).join('/'));
    };

    return (
        <Paper elevation={3} className={styles.formContainer}>
            <Typography variant="h5" gutterBottom>Website Cloner</Typography>
            
            {/* URL Input */}
            <TextField
                label="Website URL"
                variant="outlined"
                fullWidth
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => validateUrl(e.target.value)}
                className={styles.inputField}
                disabled={disabled}
                required
                error={!!urlError}
                helperText={urlError}
            />
            
            {/* Recent History Dropdown */}
            {cloneHistory.length > 0 && (
                <FormControl fullWidth variant="outlined" className={styles.inputField}>
                    <InputLabel id="recent-sites-label" sx={{ backgroundColor: 'transparent' }}>Recent Sites</InputLabel>
                    <Select
                        labelId="recent-sites-label"
                        label="Recent Sites"
                        disabled={disabled}
                        displayEmpty
                        onChange={(e) => {
                            const index = Number(e.target.value);
                            if (index >= 0) {
                                handleHistorySelect(cloneHistory[index]);
                            }
                        }}
                        value=""
                        sx={{ textAlign: 'left' }}
                    >
                        <MenuItem value="" disabled sx={{ fontStyle: 'italic', display: 'block', width: '100%' }}>
                            Select a recently cloned site
                        </MenuItem>
                        {cloneHistory.map((item, index) => (
                            <MenuItem key={index} value={index}>
                                <HistoryIcon fontSize="small" style={{ marginRight: '8px' }} />
                                {new URL(item.url).hostname} - {new Date(item.timestamp).toLocaleString()}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
            
            {/* Output Path */}
            <TextField
                label="Output Path"
                variant="outlined"
                fullWidth
                placeholder="Enter output folder path"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                className={styles.inputField}
                disabled={disabled}
                helperText="Base folder to save the cloned website files (domain name will be added automatically)"
            />
            
            {/* Options */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Options</Typography>
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={cloneAssets} 
                            onChange={(e) => setCloneAssets(e.target.checked)}
                            disabled={disabled} 
                        />
                    }
                    label="Clone Assets (images, CSS, JS)"
                    className={styles.checkbox}
                />
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={extractLibraries} 
                            onChange={(e) => setExtractLibraries(e.target.checked)}
                            disabled={disabled} 
                        />
                    }
                    label="Extract Libraries and Technologies"
                    className={styles.checkbox}
                />
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={downloadZip} 
                            onChange={(e) => setDownloadZip(e.target.checked)}
                            disabled={disabled} 
                            icon={<DownloadIcon />}
                            checkedIcon={<DownloadIcon />}
                        />
                    }
                    label="Download as ZIP when complete"
                    className={styles.checkbox}
                />
            </Box>
            
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                className={styles.button}
                disabled={disabled || !url.trim() || !!urlError}
                fullWidth
            >
                {disabled ? 'Cloning in progress...' : 'Clone Website'}
            </Button>
        </Paper>
    );
}

export default ClonerForm; 