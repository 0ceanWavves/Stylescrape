import React from 'react';
import { Typography, Box, Paper, Chip, Divider, Grid, Card, CardContent } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import HttpsIcon from '@mui/icons-material/Https';
import ImageIcon from '@mui/icons-material/Image';
import styles from './LibraryList.module.css';

/**
 * @component
 * @description Displays a list of detected libraries with improved styling.
 * @param {Object} props - Component props
 * @param {string[]} props.libraries - Array of library names.
 * @returns {JSX.Element}
 */
function LibraryList({ 
  libraries, 
  technicalAnalysis 
}: { 
  libraries: string[]; 
  technicalAnalysis?: Record<string, any> | null;
}) {
    // Get icon based on technology category
    const getTechIcon = (category: string) => {
      switch (category) {
        case 'Framework':
        case 'JavaScript Libraries':
          return <CodeIcon />;
        case 'CSS Frameworks':
        case 'Responsive Design':
          return <DesignServicesIcon />;
        case 'Web Server':
          return <StorageIcon />;
        case 'Performance':
        case 'SEO Score':
        case 'Accessibility Score':
          return <SpeedIcon />;
        case 'SSL/TLS':
          return <HttpsIcon />;
        case 'Image Formats':
          return <ImageIcon />;
        default:
          return <CodeIcon />;
      }
    };

    // Get chip color based on library name
    const getChipColor = (library: string) => {
      const libraryLower = library.toLowerCase();
      if (libraryLower.includes('react')) return 'info';
      if (libraryLower.includes('vue')) return 'success';
      if (libraryLower.includes('angular')) return 'error';
      if (libraryLower.includes('bootstrap')) return 'secondary';
      if (libraryLower.includes('jquery')) return 'warning';
      return 'default';
    };

    return (
        <div className={styles.analysisContainer}>
            <Paper elevation={2} className={styles.listContainer}>
                <Typography variant="h6" gutterBottom>
                    Detected Libraries & Technologies
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {libraries.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {libraries.map((library, index) => (
                            <Chip 
                                key={index}
                                label={library}
                                color={getChipColor(library)}
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

            {technicalAnalysis && (
                <Paper elevation={2} className={styles.technicalContainer}>
                    <Typography variant="h6" gutterBottom>
                        Technical Analysis
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                        {Object.entries(technicalAnalysis).map(([category, value], index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card variant="outlined" className={styles.analysisCard}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            {getTechIcon(category)}
                                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                                {category}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary">
                                            {value.toString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}
        </div>
    );
}

export default LibraryList; 