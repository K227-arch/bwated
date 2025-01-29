import React from 'react';
import { FileText } from 'lucide-react';
import './PDFViewer.css';

export default function PDFViewer() {
  return (
    <div className="pdf-container">
      <div className="pdf-placeholder">
        <FileText className="placeholder-icon" />
        <h2 className="placeholder-title">No PDF Selected</h2>
        <p className="placeholder-text">Upload a PDF document to get started</p>
      </div>
    </div>
  );
}
