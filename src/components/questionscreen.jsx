import React from 'react';
import Layout from './Layout.jsx';
import Question from './question.jsx';
import Sidebar from './Sidebar.jsx';
import './Documentchat.css';


 function App({ children,hideSideNav, isSideNavVisible }) {
  return (
      <div className="layout">
        <div className="layout-main">
        <Layout />  
        </div>
        <div className="layoutmain2">
        <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
          <Question />  
        </div>
        
        <main className="layout-content">
          {children}
        </main>
      </div>
    
  );
}
export default App;