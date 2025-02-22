import { useState, useRef, useEffect } from 'react';
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { supabase } from '@/lib/supabaseClient';
import './upload.css';

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;


function App({ children, hideSideNav, isSideNavVisible }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const [isExtracting, setIsExtracting] = useState(false);


  
  const extractTextFromPDF = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsExtracting(true);
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result);

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
        
        globalPopupClose?.();
        navigate('/Documentchat');
        
      } catch (error) {
        console.error('Error extracting text: ', error);
        alert('Error extracting text from PDF.');
      } finally {
        setIsExtracting(false);
      }
    };

    fileReader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading the PDF file.');
      setIsExtracting(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

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
    
    try {
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}_${file.name}`;
      let uploadError;
      
      if (file.size > 6 * 1024 * 1024) {
        uploadError = await uploadInChunks(file, filePath);
      } else {
        const { error } = await supabase.storage.from('pdfs').upload(filePath, file);
        uploadError = error;
      }

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      // Create document record in the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_type: file.type.split('/')[1],
          file_path: filePath,
          file_size: file.size,
          metadata: {
            originalName: file.name,
            contentType: file.type,
            uploadedAt: new Date().toISOString()
          }
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return;
      }

      setFile(prev => ({ ...prev, progress: 100, uploading: false }));
    } catch (error) {
      console.error('Error in upload process:', error);
    }
  };

  const uploadInChunks = async (file, filePath) => {
    const chunkSize = 6 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;
    const chunks = [];
    
    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
        const chunkPath = `${filePath}.part${i}`;
        
        const { error } = await supabase.storage.from('pdfs')
          .upload(chunkPath, chunk, { upsert: true });
        
        if (error) throw error;
        
        chunks.push(chunkPath);
        uploadedChunks++;
        setFile(prev => ({
          ...prev,
          progress: (uploadedChunks / totalChunks) * 100,
          uploading: uploadedChunks < totalChunks
        }));
      }

      // Combine chunks here if needed
      // For now, we'll just keep the first chunk as the main file
      const { error } = await supabase.storage.from('pdfs')
        .copy(chunks[0], filePath);

      // Clean up chunk files
      await Promise.all(chunks.map(chunkPath =>
        supabase.storage.from('pdfs').remove([chunkPath])
      ));

      return error;
    } catch (error) {
      // Clean up any uploaded chunks on error
      await Promise.all(chunks.map(chunkPath =>
        supabase.storage.from('pdfs').remove([chunkPath])
      ));
      return error;
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