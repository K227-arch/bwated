<<<<<<< HEAD
import { useState, useRef } from 'react';
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
=======
import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./upload.css";
import { supabase } from "@/lib/supabaseClient"; // Ensure this is correctly configured
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';
import { useNavigate } from "react-router-dom";
>>>>>>> 290513c999e2d7b45588d417442ca27062b06279

import './upload.css'

<<<<<<< HEAD
function App({ children, hideSideNav, isSideNavVisible }) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

=======
const Popup = ({
  globalPopupClose,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInput,
  file,
  isDragging,
  handleExtraction,
  isExtracting,
  progress,
  uploading,
  uploadError,
}) => {
  return (
    <div className="upload-wrapper">
      <div className="upload-container">
        <button onClick={globalPopupClose} className="x-close-popup" title="Close">
          &times;
        </button>

        <h1 className="upload-title">Upload a document to get started</h1>

        <div
          className="upload-area"
          style={{ borderColor: isDragging ? "#2dd4bf" : "#ccc" }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileInput}
            accept=".pdf"
          />
          <label htmlFor="fileInput">
            <button
              className="upload-button"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("fileInput").click();
              }}
            >
              Upload document
            </button>
          </label>

          {file && <p className="file-name">Selected File: {file.name}</p>}

          {uploading && (
            <div>
              <p>Uploading: {progress}%</p>
              <progress value={progress} max="100"></progress>
            </div>
          )}

          {uploadError && <p className="error-text">Upload Error: {uploadError}</p>}
        </div>

        <p className="terms-text">
          By uploading a document, you agree to and have read our{" "}
          <a href="#terms">Terms</a> and <a href="#conditions">Conditions</a>.
        </p>

        {file && (
          <button className="close-btn" onClick={handleExtraction} disabled={isExtracting}>
            {isExtracting ? 'Extracting...' : 'Extract'}
          </button>
        )}
        <button className="close-btn" onClick={globalPopupClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const App = ({ globalPopupClose = () => {}, hideSideNav, isSideNavVisible }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();

  // Drag & Drop Handlers
>>>>>>> 290513c999e2d7b45588d417442ca27062b06279
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const newFiles = Array.from(e.dataTransfer.files)
    addFiles(newFiles)
  }

  const handleFileInput = (e) => {
<<<<<<< HEAD
    const newFiles = Array.from(e.target.files)
    addFiles(newFiles)
  }

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4']
      return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024
    })
=======
    const files = e.target.files;
    if (files.length) {
      localStorage.removeItem('extractedText');
      localStorage.removeItem('fileName');
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setUploadError(null);
    uploadFile(selectedFile);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);
    setUploadError(null);

    try {
      const user = sessionStorage.getItem("user");
      if (!user) {
        alert("not logged in");
        return
      }
      console.log(user)
      const { data, error } = await supabase.storage
        .from("pdfs") 
        .upload(`files/${file.name}`, file, {
          cacheControl: "3600",
          upsert: true,
          progress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(percent);
          },
        });

      if (error) throw error;
      console.log("File uploaded successfully:", data);

    } catch (error) {
      console.error("Upload Error:", error.message);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };
>>>>>>> 290513c999e2d7b45588d417442ca27062b06279

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      progress: 0,
      uploading: true
    }))])

<<<<<<< HEAD
    // Simulate upload progress
    validFiles.forEach((file, index) => {
      simulateUpload(files.length + index)
    })
  }
=======
    setIsExtracting(true);
    setUploadError(null);

    const fileReader = new FileReader();
>>>>>>> 290513c999e2d7b45588d417442ca27062b06279

  const simulateUpload = (fileIndex) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setFiles(prev => prev.map((file, index) => 
        index === fileIndex 
          ? { ...file, progress, uploading: progress < 100 }
          : file
      ))

<<<<<<< HEAD
      if (progress >= 100) {
        clearInterval(interval)
=======
      try {
        const pdfDocument = await getDocument(typedArray).promise;
        let extractedText = '';

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
          const page = await pdfDocument.getPage(pageNumber);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
        }

        localStorage.setItem('extractedText', extractedText);
        localStorage.setItem('fileName', file.name);
        
        globalPopupClose();
        navigate('/Documentchat');
        
      } catch (error) {
        console.error('Extraction Error:', error);
        setUploadError("Error extracting text from PDF.");
        alert('Error extracting text from PDF.');
      } finally {
        setIsExtracting(false);
>>>>>>> 290513c999e2d7b45588d417442ca27062b06279
      }
    }, 200)
  }

<<<<<<< HEAD
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="upload-container">
       <Header />
       <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="cloud-icon">☁️</div>
        <p>Choose a file or drag & drop it here</p>
        <p className="file-info">JPEG, PNG, PDF and MP4 formats, up to 100 MB.</p>
        <button 
          className="upload-button"
          onClick={() => fileInputRef.current.click()}
        >
          Upload File
        </button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.mp4"
          style={{ display: 'none' }}
        />
      </div>

      <div className="file-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <div className="file-info">
              <div className="file-icon">
                {file.file.type.includes('pdf') ? '📄' : '📁'}
              </div>
              <div className="file-details">
                <div className="file-name">{file.file.name}</div>
                <div className="file-size">
                  {Math.round(file.file.size / 1024)} KB of 100 MB
                </div>
              </div>
              <button 
                className="remove-button"
                onClick={() => removeFile(index)}
              >
                ✕
              </button>
            </div>
            <div className="progress-bar">
              <div 
                className="progress"
                style={{ width: `${file.progress}%` }}
              />
              <div className="progress-text">
                {file.uploading ? 'Uploading...' : 'Completed'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
=======
    fileReader.onerror = () => {
      console.error('Error reading file');
      setUploadError("Error reading the PDF file.");
      alert('Error reading the PDF file.');
      setIsExtracting(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div className="app">
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      <Header />
      <Popup
        globalPopupClose={globalPopupClose}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleFileInput={handleFileInput}
        file={file}
        isDragging={isDragging}
        handleExtraction={extractTextFromPDF}
        isExtracting={isExtracting}
        progress={progress}
        uploading={uploading}
        uploadError={uploadError}
      />
    </div>
  );
};
>>>>>>> 290513c999e2d7b45588d417442ca27062b06279

