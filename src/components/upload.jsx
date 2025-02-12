import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./upload.css";
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';
import { useNavigate } from "react-router-dom";

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

// Popup Component (Placed outside to maintain structure)
const Popup = ({
  globalPopupClose,
  onClose,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInput,
  file,
  isDragging,
  handleExtraction,
  isExtracting
}) => {
  return (
    <div className="upload-wrapper">
      <div className="upload-container">
        <button
          onClick={() => globalPopupClose?.()}
          className="x-close-popup"
          title="Close"
        >
          &times;
        </button>
        <div className="layout-main">
          <Header />
        </div>
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
        </div>

        <p className="terms-text">
          By uploading a document, you agree to and have read our{" "}
          <a href="#terms">Terms</a> and <a href="#conditions">Conditions</a>.
        </p>

        {/* Close Button placed correctly */}
        {file && (
          <button 
            className="close-btn" 
            onClick={handleExtraction}
            disabled={isExtracting}
          >
            {isExtracting ? 'Extracting...' : 'Extract'}
          </button>
        )}
        <button className="close-btn" onClick={() => globalPopupClose?.()}>
          Close
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = ({ globalPopupClose = () => {}, hideSideNav, isSideNavVisible }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're not explicitly trying to upload a new file
    const isUploadingNew = new URLSearchParams(window.location.search).get('new');
    
    if (!isUploadingNew) {
      const existingPDF = localStorage.getItem('extractedText');
      const fileName = localStorage.getItem('fileName');
      
      if (existingPDF && fileName) {
        globalPopupClose?.();
        navigate('/Documentchat');
      }
    }
  }, [navigate, globalPopupClose]);

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
      // Clear existing PDF data when new file is selected
      localStorage.removeItem('extractedText');
      localStorage.removeItem('fileName');
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const selectedFile = files[0]; // Assuming single file upload
    setFile(selectedFile);
    console.log("File to upload:", selectedFile);
  };

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

  return (
    <div className="app">
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      <Popup
        globalPopupClose={globalPopupClose}
        onClose={() => setShowPopup(false)}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleFileInput={handleFileInput}
        file={file}
        isDragging={isDragging}
        handleExtraction={extractTextFromPDF}
        isExtracting={isExtracting}
      />
    </div>
  );
};

export default App;
