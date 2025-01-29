import { useState, useEffect } from "react";
import Upload from './upload.jsx';
import './pop.css';


const Popup = ({ onClose }) => {
  return (
    
    <div className="popup-overlay">
      <div className="pops">
        <Upload />
        
      </div>
      
      <div className="popup">
        
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const App = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(true); // Show popup when page loads
  }, []);

  return (
    <div className="app">
      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
      <h1>Main Page Content</h1>
    </div>
  );
};

export default App;
