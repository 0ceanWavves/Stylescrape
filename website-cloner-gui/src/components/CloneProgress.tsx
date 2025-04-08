import React, { useState } from 'react';
import { LinearProgress, Typography, Box, Paper, List, ListItem, ListItemIcon, ListItemText, Collapse, Button, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import styles from './CloneProgress.module.css';

// Define file type icons based on file extensions
const getFileIcon = (step: string) => {
    if (step.includes('.html')) return '🌐';
    if (step.includes('.css')) return '🎨';
    if (step.includes('.js')) return '📜';
    if (step.includes('.png') || step.includes('.jpg') || step.includes('.jpeg') || step.includes('.gif') || step.includes('.svg')) return '🖼️';
    if (step.includes('.json')) return '📋';
    if (step.includes('.ttf') || step.includes('.woff')) return '🔤';
    return '📄';
};

/**
 * @component
 * @description Displays the progress of the cloning process with a more visual approach.
 * @param {Object} props - Component props
 * @param {string[]} props.steps - Array of steps in the cloning process.
 * @returns {JSX.Element}
 */
function CloneProgress({ steps }: { steps: string[]; }) {
    const [expanded, setExpanded] = useState(false);
    
    // Calculate stats
    const htmlFiles = steps.filter(step => step.includes('.html')).length;
    const cssFiles = steps.filter(step => step.includes('.css')).length;
    const jsFiles = steps.filter(step => step.includes('.js')).length;
    const imageFiles = steps.filter(step => 
        step.includes('.png') || 
        step.includes('.jpg') || 
        step.includes('.jpeg') || 
        step.includes('.gif') || 
        step.includes('.svg')
    ).length;
    
    // Calculate a rough progress percentage (limited to 100%)
    const progressValue = Math.min(100, (steps.length / 10) * 100); 
    
    // Count total files excluding info messages
    const totalFiles = steps.filter(step => 
        step.includes('Downloaded') || 
        step.includes('Processed')
    ).length;

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <Paper elevation={2} className={styles.progressContainer}>
            <Typography variant="h6" gutterBottom>Cloning Progress</Typography>
            
            <Box sx={{ display: 'flex', mb: 2, mt: 2 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 1 }}>
                    <Typography variant="h4" color="primary">{totalFiles}</Typography>
                    <Typography variant="caption">Files</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 1 }}>
                    <Typography variant="h4" color="primary">{htmlFiles}</Typography>
                    <Typography variant="caption">HTML</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 1 }}>
                    <Typography variant="h4" color="primary">{cssFiles}</Typography>
                    <Typography variant="caption">CSS</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 1 }}>
                    <Typography variant="h4" color="primary">{jsFiles}</Typography>
                    <Typography variant="caption">JS</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 1 }}>
                    <Typography variant="h4" color="primary">{imageFiles}</Typography>
                    <Typography variant="caption">Images</Typography>
                </Box>
            </Box>
            
            <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress 
                    variant="determinate" 
                    value={progressValue} 
                    sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 0.5 }}>
                    {Math.round(progressValue)}%
                </Typography>
            </Box>
            
            <List dense className={styles.stepsContainer}>
                {steps.slice(0, expanded ? steps.length : 5).map((step, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '36px' }}>
                            {step.includes('Downloaded') ? (
                                <span style={{ fontSize: '1.2rem' }}>{getFileIcon(step)}</span>
                            ) : index === steps.length - 1 ? (
                                <CircleIcon color="primary" fontSize="small" />
                            ) : (
                                <CheckCircleIcon color="success" fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText 
                            primary={step}
                            primaryTypographyProps={{ 
                                variant: 'body2',
                                sx: { 
                                    fontFamily: 'monospace',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                } 
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            
            {steps.length > 5 && (
                <Button 
                    size="small" 
                    onClick={toggleExpanded}
                    fullWidth
                    sx={{ mt: 1 }}
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                    {expanded ? 'Show Less' : `Show All (${steps.length}) Steps`}
                </Button>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                    <CodeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Web scraping completed
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                    <DownloadIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Files ready for analysis
                </Typography>
            </Box>
        </Paper>
    );
}

export default CloneProgress; 