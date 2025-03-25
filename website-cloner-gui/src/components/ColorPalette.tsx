import React from 'react';
import styles from './ColorPalette.module.css';

interface ColorPaletteProps {
  originalPalette: string[];
  lightenedPalette: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ originalPalette, lightenedPalette }) => {
  // Make sure both palettes are the same length
  const colorPairs = originalPalette.map((color, index) => ({
    original: color,
    lightened: lightenedPalette[index] || color
  }));

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Color Palette</h3>
      <div className={styles.description}>
        The system has extracted the main colors and created lighter alternatives.
      </div>
      
      <div className={styles.colorGrid}>
        {colorPairs.map((pair, index) => (
          <div key={index} className={styles.colorPair}>
            <div className={styles.colorItem}>
              <div 
                className={styles.colorSwatch} 
                style={{ 
                  backgroundColor: pair.original.startsWith('#') ? pair.original : 
                    pair.original.includes('-') ? `var(--color-${pair.original})` : pair.original
                }}
              />
              <div className={styles.colorLabel}>
                {pair.original}
              </div>
            </div>
            <div className={styles.arrow}>→</div>
            <div className={styles.colorItem}>
              <div 
                className={styles.colorSwatch} 
                style={{ 
                  backgroundColor: pair.lightened.startsWith('#') ? pair.lightened : 
                    pair.lightened.includes('-') ? `var(--color-${pair.lightened})` : pair.lightened
                }}
              />
              <div className={styles.colorLabel}>
                {pair.lightened}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.applySection}>
        <button className={styles.applyButton}>
          Apply Lighter Palette to Dashboard
        </button>
        <span className={styles.applyText}>
          Use these colors in the user dashboard UI
        </span>
      </div>
    </div>
  );
};

export default ColorPalette; 