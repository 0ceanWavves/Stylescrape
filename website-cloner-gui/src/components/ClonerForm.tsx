import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Box, Typography, Paper } from '@mui/material';
import styles from './ClonerForm.module.css';

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
    onClone: (url: string, options: { cloneAssets: boolean; extractLibraries: boolean; outputPath: string; }) => void; 
    disabled?: boolean;
}) {
    const [url, setUrl] = useState('');
    const [cloneAssets, setCloneAssets] = useState(true);
    const [extractLibraries, setExtractLibraries] = useState(false);
    const [outputPath, setOutputPath] = useState('./cloned-site');

    const handleSubmit = () => {
        // Basic validation
        if (!url.trim()) {
            alert('Please enter a valid URL');
            return;
        }

        // Add protocol if missing
        let processedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            processedUrl = 'https://' + url;
        }

        onClone(processedUrl, { cloneAssets, extractLibraries, outputPath });
    };

    return (
        <Paper elevation={3} className={styles.formContainer}>
            <Typography variant="h5" gutterBottom>Website Cloner</Typography>
            <TextField
                label="Website URL"
                variant="outlined"
                fullWidth
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={styles.inputField}
                disabled={disabled}
                required
            />
            <TextField
                label="Output Path"
                variant="outlined"
                fullWidth
                placeholder="Enter output folder path (e.g., ./cloned-site)"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                className={styles.inputField}
                disabled={disabled}
                helperText="Where to save the cloned website files"
            />
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
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                className={styles.button}
                disabled={disabled || !url.trim()}
            >
                {disabled ? 'Cloning in progress...' : 'Clone Website'}
            </Button>
        </Paper>
    );
}

export default ClonerForm; 