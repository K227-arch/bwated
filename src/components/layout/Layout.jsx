import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';


 function App({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
export default App;