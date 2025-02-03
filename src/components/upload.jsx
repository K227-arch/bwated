import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './upload.css';

// Popup Component (Placed outside to maintain structure)
const Popup = ({ onClose, handleDragOver, handleDragLeave, handleDrop, handleFileInput, file, isDragging }) => {
  return (
    <div className="upload-container">
      <div className="layout-main">
        <Header />
        <Sidebar />
      </div>
      <h1 className="upload-title">Upload a document to get started</h1>

      <div
        className="upload-area"
        style={{ borderColor: isDragging ? '#2dd4bf' : '#ccc' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
        <label htmlFor="fileInput">
          <button
            className="upload-button"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('fileInput').click();
            }}
          >
            Upload document
          </button>
        </label>

        {file && <p className="file-name">Selected File: {file.name}</p>}
      </div>

      <p className="terms-text">
        By uploading a document, you agree to and have read our{' '}
        <a href="#terms">Terms</a> and <a href="#conditions">Conditions</a>.
      </p>

      {/* Close Button placed correctly */}
      <button className="close-btn" onClick={onClose}>Extract</button>
    </div>
  );
};

// Main App Component
const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setShowPopup(true); // Show popup when page loads
  }, []);

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const selectedFile = files[0]; // Assuming single file upload
    setFile(selectedFile);
    console.log('File to upload:', selectedFile);
  };

  return (
    <div className="app">
      {showPopup && (
        <Popup 
          onClose={() => setShowPopup(false)} 
          handleDragOver={handleDragOver} 
          handleDragLeave={handleDragLeave} 
          handleDrop={handleDrop} 
          handleFileInput={handleFileInput} 
          file={file} 
          isDragging={isDragging}
        />
      )}
      
    </div>
  );
};

export default App;

