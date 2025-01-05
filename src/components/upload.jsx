import { useState } from 'react'
import Header from './Header'
import './upload.css'
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [pdfFile, setPdfFile] = useState(null);
  const [text, setText] = useState('');


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
      setPdfFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length) {
      setPdfFile(files[0])
    }
  }

 
  const handleFiles = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const extractText = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file.');
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      try {
         const pdf = await pdfjsLib.getDocument(pdfData).promise;
        const textContent = [];

        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const pageText = await page.getTextContent();
          const textItems = pageText.items.map((item) => item.str);
          textContent.push(textItems.join(' '));
        }

        const extractedText = textContent.join('\n');
        setText(extractedText);

        
        localStorage.setItem('extractedText', extractedText);
      } catch (err) {
        console.error('Error extracting text:', err);
        alert('An error occurred while extracting text from the PDF.');
      }
    };

    fileReader.readAsArrayBuffer(pdfFile);
  };

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

      <div>
        <button onClick={extractText}>Extract Text</button>
      </div>

      <p className="terms-text">
        By uploading a document, you agree to and have read our{' '}
        <a href="#terms">Terms</a> and <a href="#conditions">Conditions</a>.
      </p>
    </div>
  )
}

export default App
