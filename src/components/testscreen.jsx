import React from 'react';
import { ArrowLeft,Logs, Notebook } from 'lucide-react';
import './testscreen.css';
import Generator from './generator';

export default function BackButton() {
  return (
    <div className="testscreen">
        
            <button className="back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
            Back to chat
           </button>
           <h1>Welcome to the Test Space</h1>
        
            <Generator />

    </div>

  )
}