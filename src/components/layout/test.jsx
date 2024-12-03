import React from 'react';
import Sidebar from './Sidebar';
import Layout from './Layout';
import Testscreen from '../features/testscreen.jsx';
import './Documentchat.css';


 function App({ children }) {
  return (
      <div className="layout">
        <div className="layout-main">
        <Layout />  
        </div>
        <div className="layoutmain2">
          <Testscreen />  
        </div>
        
        <main className="layout-content">
          {children}
        </main>
      </div>
    
  );
}
export default App;