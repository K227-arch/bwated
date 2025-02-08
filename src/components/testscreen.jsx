import React from 'react';
import { ArrowLeft,Logs, Notebook } from 'lucide-react';
import './testscreen.css';
import Generator from './generator';

export default function BackButton() {
  return (
    <div className="testscreen">
        
           <h1>Welcome to the Test Space</h1>
        
            <Generator />

    </div>

  )
}