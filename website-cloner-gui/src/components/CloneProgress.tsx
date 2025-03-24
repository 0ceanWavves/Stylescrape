import React from 'react';
import { LinearProgress, Typography, Box, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import styles from './CloneProgress.module.css';

/**
 * @component
 * @description Displays the progress of the cloning process with a more visual approach.
 * @param {Object} props - Component props
 * @param {string[]} props.steps - Array of steps in the cloning process.
 * @returns {JSX.Element}
 */
function CloneProgress({ steps }: { steps: string[]; }) {
    // Calculate a rough progress percentage (limited to 100%)
    const progressValue = Math.min(100, (steps.length / 10) * 100); 

    return (
        <Paper elevation={2} className={styles.progressContainer}>
            <Typography variant="h6" gutterBottom>Cloning Progress</Typography>
            
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
                {steps.slice(0, 10).map((step, index) => (
                    <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: '36px' }}>
                            {index === steps.length - 1 ? (
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
                
                {steps.length > 10 && (
                    <Typography color="text.secondary" align="center" sx={{ mt: 1 }}>
                        + {steps.length - 10} more steps...
                    </Typography>
                )}
            </List>
        </Paper>
    );
}

export default CloneProgress; 