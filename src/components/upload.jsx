import { useState, useRef } from 'react';
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

import './upload.css'

function App({ children, hideSideNav, isSideNavVisible }) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

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
    const newFiles = Array.from(e.target.files)
    addFiles(newFiles)
  }

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4']
      return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024
    })

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      progress: 0,
      uploading: true
    }))])

    // Simulate upload progress
    validFiles.forEach((file, index) => {
      simulateUpload(files.length + index)
    })
  }

  const simulateUpload = (fileIndex) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setFiles(prev => prev.map((file, index) => 
        index === fileIndex 
          ? { ...file, progress, uploading: progress < 100 }
          : file
      ))

      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

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

