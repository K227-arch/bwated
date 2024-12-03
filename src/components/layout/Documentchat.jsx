import React from 'react';
import Sidebar from './Sidebar';
import Layout from './Layout';
import ChatInterface from '../features/ChatInterface.jsx';
import './Documentchat.css';


 function App({ children }) {
  return (
      <div className="layout">
        <div className="layout-main">
        <Layout />  
        </div>
        <div className="layoutmain2">
          <ChatInterface />  
        </div>
        
        <main className="layout-content">
          {children}
        </main>
      </div>
    
  );
}
export default App;