import { useState } from 'react'
import Header from './Header'
import './upload.css'

function App() {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length) {
      handleFiles(files)
    }
  }

  const handleFiles = (files) => {
    // Handle file upload logic here
    console.log('Files to upload:', files)
  }

  return (
    
    <div className="upload-container">
      <div className="layout-main">
        <Header />
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
          <button className="upload-button" onClick={() => document.getElementById('fileInput').click()}>
            Upload document
          </button>
        </label>
      </div>

      <p className="terms-text">
        By uploading a document, you agree to and have read our{' '}
        <a href="#terms">Terms</a> and <a href="#conditions">Conditions</a>.
      </p>
    </div>
  )
}

export default App
