import { useState, useRef, useEffect } from 'react';
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { supabase } from '@/lib/supabaseClient';
import './upload.css';

function App({ children, hideSideNav, isSideNavVisible }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const newFile = e.dataTransfer.files[0];
    addFile(newFile);
  };

  const handleFileInput = (e) => {
    const newFile = e.target.files[0];
    addFile(newFile);
  };

  const addFile = (newFile) => {
    if (!user) return alert("Please log in to upload a file");
    
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
    if (!validTypes.includes(newFile.type) || newFile.size > 100 * 1024 * 1024) {
      alert("Invalid file type or size exceeds limit");
      return;
    }
    
    setFile({ file: newFile, progress: 0, uploading: true });
    uploadFile(newFile);
  };

  const uploadFile = async (file) => {
    if (!user) return;
    
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    
    if (file.size > 6 * 1024 * 1024) {
      await uploadInChunks(file, filePath);
    } else {
      const { error } = await supabase.storage.from('pdfs').upload(filePath, file);
      if (error) return console.error('Upload error:', error);
      setFile(prev => ({ ...prev, progress: 100, uploading: false }));
    }
  };

  const uploadInChunks = async (file, filePath) => {
    const chunkSize = 6 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;
    
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const { error } = await supabase.storage.from('pdfs').upload(`${filePath}.part${i}`, chunk, { upsert: true });
      
      if (error) return console.error('Chunk upload error:', error);
      uploadedChunks++;
      setFile(prev => ({ ...prev, progress: (uploadedChunks / totalChunks) * 100, uploading: uploadedChunks < totalChunks }));
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="upload-container">
      <Header />
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      <div className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="cloud-icon">☁️</div>
        <p>Choose a file or drag & drop it here</p>
        <p className="file-info">JPEG, PNG, PDF and MP4 formats, up to 100 MB.</p>
        <button className="upload-button" onClick={() => fileInputRef.current.click()}>
          Upload File
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".jpg,.jpeg,.png,.pdf,.mp4" style={{ display: 'none' }} />
      </div>

      {file && (
        <div className="file-item">
          <div className="file-info">
            <div className="file-icon">{file.file.type.includes('pdf') ? '📄' : '📁'}</div>
            <div className="file-details">
              <div className="file-name">{file.file.name}</div>
              <div className="file-size">{Math.round(file.file.size / 1024)} KB of 100 MB</div>
            </div>
            <button className="remove-button" onClick={removeFile}>✕</button>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${file.progress}%` }} />
            <div className="progress-text">{file.uploading ? 'Uploading...' : 'Completed'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;