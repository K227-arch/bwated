import { ArrowLeft } from 'lucide-react'
import './testscreen.css';

export default function BackButton() {
  return (
    <div className="testscreen">
        
            <button className="back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
            Back to chat
           </button>
        
        <div className="container">
      
          <h1>Welcome to Test Space</h1>
          <p>Your minimalist workspace for focused testing</p>
          
      
    </div>

    </div>

  )
}