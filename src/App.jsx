import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Home.jsx';
import Plan from './components/plan.jsx';
import Documentchat from './components/Documentchat.jsx';
import Load from './components/Load.jsx';
import Login from './components/Login.jsx';
import PDFViewer from './components/PDFViewer.jsx';
import Test from './components/test.jsx';
import Signup from './components/signup.jsx';
import Dashboard  from './components/dashboard.jsx';
import Question from './components/questionscreen.jsx';
import Documenttitle from './components/documenttitle.jsx';
import Upload from './components/upload.jsx';
import './App.css'




function App() {
  return (
    
    
    <Router>
      
      <Load>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/Signup" element={<Signup />} />

          
          <Route path="/plan" element={<Plan />} />
          <Route path="/home" element={<Home />} />
          
          <Route path="/documenttitle" element={<Documenttitle />} />
          <Route path="/documentchat" element={<Documentchat />} />
          <Route path ="/dashboard" element={<Dashboard />}/>
          <Route path="/PDFViewer" element={<PDFViewer />} />
          <Route path="/Test" element={<Test />} />
          <Route path="/Question" element={<Question />} />
          <Route path="/Upload" element={<Upload />} />
         



        </Routes>
      </Load>
    </Router>
  );
}

export default App;
