import React from 'react';
import { Typography, Box, Paper, Chip, Divider } from '@mui/material';
import styles from './LibraryList.module.css';

/**
 * @component
 * @description Displays a list of detected libraries with improved styling.
 * @param {Object} props - Component props
 * @param {string[]} props.libraries - Array of library names.
 * @returns {JSX.Element}
 */
function LibraryList({ libraries }: { libraries: string[]; }) {
    return (
        <Paper elevation={2} className={styles.listContainer}>
            <Typography variant="h6" gutterBottom>Detected Libraries & Technologies</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {libraries.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {libraries.map((library, index) => (
                        <Chip 
                            key={index}
                            label={library}
                            color="primary"
                            variant="outlined"
                            size="medium"
                            sx={{ m: 0.5 }}
                        />
                    ))}
                </Box>
            ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No libraries or technologies were detected.
                </Typography>
            )}
        </Paper>
    );
}

export default LibraryList; 