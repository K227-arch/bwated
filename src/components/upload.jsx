import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./upload.css";
import { supabase } from "@/lib/supabaseClient"; // Ensure this is correctly configured
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';
import { useNavigate } from "react-router-dom";

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

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

  const extractTextFromPDF = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsExtracting(true);
    setUploadError(null);

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
        
        globalPopupClose();
        navigate('/Documentchat');
        
      } catch (error) {
        console.error('Extraction Error:', error);
        setUploadError("Error extracting text from PDF.");
        alert('Error extracting text from PDF.');
      } finally {
        setIsExtracting(false);
      }
    };

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

export default App;
