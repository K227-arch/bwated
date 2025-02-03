import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home.jsx';
import Plan from './components/plan.jsx';
import Documentchat from './components/Documentchat.jsx';
import Load from './components/Load.jsx';
import Login from './components/Login.jsx';
import PDFViewer from './components/PDFViewer.jsx';
import Test from './components/test.jsx';
import Signup from './components/signup.jsx';
import Dashboard from './components/dashboard.jsx';
import Question from './components/questionscreen.jsx';
import Documenttitle from './components/documenttitle.jsx';
import Upload from './components/upload.jsx';
import Adminside from './components/Admin/adminside.jsx';
import Landing from './components/Landing.jsx';
import FAQ from './components/FAQ.jsx';
import Footer from './components/Footer.jsx';
import Recording from './components/Recording.jsx';
import Loader from './components/Loader.jsx';
import Feedback from './components/feedback.jsx';
import Pop from './components/Pop.jsx';
import './App.css';

const AppRoutes = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation(); // ✅ Now inside Router

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000); // Simulate load delay
  }, [location]);

  return (
    <Load>
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Loader" element={<Loader />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/Upload" element={<Upload />} />
        <Route path="/Pop" element={<Pop />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Adminside" element={<Adminside />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Recording" element={<Recording />} />
        <Route path="/documenttitle" element={<Documenttitle />} />
        <Route path="/documentchat" element={<Documentchat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/PDFViewer" element={<PDFViewer />} />
        <Route path="/Test" element={<Test />} />
        <Route path="/Question" element={<Question />} />
        <Route path="/Feedback" element={<Feedback />} />
        <Route path="/Footer" element={<Footer />} />
      </Routes>
    </Load>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;

