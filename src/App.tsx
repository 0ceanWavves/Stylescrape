import React, { useState } from 'react';
import ClonerForm from './components/ClonerForm';
import CloneProgress from './components/CloneProgress';
import LibraryList from './components/LibraryList';
import styles from './styles.module.css';

/**
 * @component
 * @description Main application component for the website cloner GUI.
 * @returns {JSX.Element}
 */
function App() {
  const [cloning, setCloning] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [libraries, setLibraries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null); // Add error state

  const handleClone = async (url: string, options: { cloneAssets: boolean; extractLibraries: boolean; }) => {
    setCloning(true);
    setProgress([]);
    setLibraries([]);
    setError(null); // Clear previous errors

    try {
      const response = await fetch('http://localhost:3001/api/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, ...options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Cloning failed');
      }

      const data = await response.json();

      // Update progress and libraries based on the response data
      // (This will depend on the actual output of your Node.js scripts)
      if (data.progress) {
        setProgress(data.progress);
      }
      if (data.libraries) {
        setLibraries(data.libraries);
      }
      // Example: if your script outputs steps one by one:
      //  setProgress(prev => [...prev, data.currentStep]);

    } catch (err:any) {
      setError(err.message);
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className={styles.container}>
      <ClonerForm onClone={handleClone} />
      {cloning && <CloneProgress steps={progress} />}
      {!cloning && progress.length > 0 && <LibraryList libraries={libraries} />}
      {error && <div className={styles.error}>{error}</div>} {/* Display errors */}
    </div>
  );
}

export default App; 