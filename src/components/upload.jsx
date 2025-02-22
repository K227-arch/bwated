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
  const [pdfContent, setPdfContent] = useState(''); 
  const [documentId, setDocumentId] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'extracting', 'completed', 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  
const navigate = useNavigate();
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
    
    const validTypes = [  'application/pdf' ];
    if (!validTypes.includes(newFile.type) || newFile.size > 100 * 1024 * 1024) {
      alert("Invalid file type or size exceeds limit");
      return;
    }
    
    setFile({ file: newFile, progress: 0, uploading: true });
    uploadFile(newFile);
  };

  const uploadFile = async (file) => {
    if (!user) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage(null);
    
    try {
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}_${file.name}`;
      let uploadError;
      
      if (file.size > 6 * 1024 * 1024) {
        uploadError = await uploadInChunks(file, filePath);
      } else {
        setUploadProgress(10);
        const { error } = await supabase.storage.from('pdfs').upload(filePath, file);
        uploadError = error;
        setUploadProgress(50);
      }

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      setUploadProgress(70);
      
      // Create document record
      const { data: documentData, error: dbError } = await supabase
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
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploadProgress(90);
 
      setUploadStatus('extracting');
      await extractTextFromPDF(file);
      
      setUploadStatus('completed');
      setUploadProgress(100);
      setTimeout(() => {
        navigate('/documentchat', { 
          state: { 
            success: true,
            message: 'File uploaded successfully!',
            documentId: documentData.id 
          } 
        });
      }, 1000);
    } catch (error) {
      console.error('Error in upload process:', error);
      setErrorMessage(error.message);
      setUploadStatus('error');
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

  const extractTextFromPDF = async (file) => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result);

      try {
        const pdfDocument = await getDocument(typedArray).promise;
        let extractedText = '';
        const totalPages = pdfDocument.numPages;

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
          const page = await pdfDocument.getPage(pageNumber);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
          
          // Update extraction progress
          setExtractionProgress((pageNumber / totalPages) * 100);
        }

        localStorage.setItem('extractedText', extractedText);
        localStorage.setItem('fileName', file.name);
        setPdfContent(extractedText);
        console.log(extractedText);
         
      } catch (error) {
        console.error('Error extracting text: ', error);
        alert('Error extracting text from PDF.');
      } finally {
        setIsExtracting(false);
        setExtractionProgress(0);
      }
    };

    fileReader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading the PDF file.');
      setIsExtracting(false);
      setExtractionProgress(0);
    };

    fileReader.readAsArrayBuffer(file);
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="upload-container">
      <Header />
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)}>Dismiss</button>
        </div>
      )}

      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''} ${uploadStatus !== 'idle' ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="cloud-icon">
          {uploadStatus === 'idle' && '☁️'}
          {uploadStatus === 'uploading' && '📤'}
          {uploadStatus === 'extracting' && '📄'}
          {uploadStatus === 'completed' && '✅'}
          {uploadStatus === 'error' && '❌'}
        </div>
        
        {uploadStatus === 'idle' ? (
          <>
            <p>Choose a file or drag & drop it here</p>
            <p className="file-info">Upload PDF format only</p>
            <button 
              className="upload-button" 
              onClick={() => fileInputRef.current.click()}
            >
              Upload File
            </button>
          </>
        ) : (
          <div className="upload-status">
            <h3>{file?.file.name}</h3>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
              <div className="progress-text">
                {uploadStatus === 'uploading' && `Uploading... ${Math.round(uploadProgress)}%`}
                {uploadStatus === 'extracting' && `Extracting text... ${Math.round(extractionProgress)}%`}
                {uploadStatus === 'completed' && 'Upload completed!'}
                {uploadStatus === 'error' && 'Upload failed'}
              </div>
            </div>
            
            {uploadStatus !== 'completed' && (
              <button 
                className="cancel-button" 
                onClick={removeFile}
              >
                Cancel
              </button>
            )}
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          accept=".pdf" 
          style={{ display: 'none' }} 
        />
      </div>
    </div>
  );
}

export default App;