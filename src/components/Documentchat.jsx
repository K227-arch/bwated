import React from 'react';
import Layout from './Layout.jsx';
import ChatInterface from './ChatInterface.jsx';
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