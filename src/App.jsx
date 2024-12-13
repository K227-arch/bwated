import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Home.jsx';
import Plan from './components/plan.jsx';
import Documentchat from './components/Documentchat.jsx';
import Load from './components/Load.jsx';
import Login from './components/Login.jsx';
import PDFViewer from './components/PDFViewer.jsx';
import Test from './components/test.jsx';


function App() {
  return (
    
    
    <Router>
      
      <Load>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/home" element={<Home />} />
          <Route path="/documentchat" element={<Documentchat />} />
          <Route path="/PDFViewer" element={<PDFViewer />} />
          <Route path="/Test" element={<Test />} />


        </Routes>
      </Load>
    </Router>
  );
}

export default App;
