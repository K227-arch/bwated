import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./components/Home.jsx";
import Plan from "./components/plan.jsx";
import Documentchat from "./components/Documentchat.jsx";
import Load from "./components/Load.jsx";
import Login from "./components/Login.jsx";
import PDFViewer from "./components/PDFViewer.jsx";
import Test from "./components/test.jsx";
import Signup from "./components/signup.jsx";
import Dashboard from "./components/dashboard.jsx";
import Question from "./components/questionscreen.jsx";
import Documenttitle from "./components/documenttitle.jsx";
import Upload from "./components/upload.jsx";
import Adminside from "./components/Admin/adminside.jsx";
import Landing from "./components/Landing.jsx";
import FAQ from "./components/FAQ.jsx";
import Footer from "./components/Footer.jsx";
import Recording from "./components/Recording.jsx";
import Loader from "./components/Loader.jsx";
import Feedback from "./components/feedback.jsx";
import Notifications from "./components/Admin/notifications.jsx";
import Pop from "./components/Pop.jsx";
import Users from "./components/Admin/Users.jsx";
import Token from "./components/Admin/token.jsx";
import Packages from "./components/Admin/Packages.jsx";
import Admindashboard from "./components/Admin/Admindashboard.jsx";
import Transactions from "./components/Admin/Transactions.jsx";
import "./App.css";
import ProtectedRoute from "./components/protected/ProtectedRoute.jsx";
import ProtectedRouteAdmin from "./components/protected/ProtectedRouteAdmin.jsx";
import TestDetails from './components/TestDetails';
import CheckoutForm from './components/CheckoutForm';
const AppRoutes = () => {
  /**
   * ------------------------------------------------------
   *
   * This is the global Navigation Bar state contrl
   *
   * --------------------------------------------------------
   */
  const [isNavVisible, setNavVisible] = useState(true);

  /**
   * Function Event Pulled from the items that have navigation menu
   * to activate the visibility of the sidebar
   */
  function ShowSideNav() {
    setNavVisible(true);
  }

  /**
   * Function event  pulled from the Sidebar -> Layout-> to Here
   */

  function hideSideNav() {
    setNavVisible(false);
  }

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
              <Route path="/Pop" element={<Pop />} />
              <Route path="/Signup" element={<Signup />} />


            <Route element={<ProtectedRouteAdmin />}>
 
              <Route path="/Adminside" element={<Adminside />} />
              <Route path="/Transactions" element={<Transactions />} />
              <Route path="/Notifications" element={<Notifications />} />
              <Route path="/Users" element={<Users />} />
              <Route path="/Token" element={<Token />} />
              <Route path="/Packages" element={<Packages />} />
              <Route path="/admindashboard" element={<Admindashboard />} />
          </Route>



        <Route
          path="/home"
          element={
            <Home hideSideNav={hideSideNav} isSideNavVisible={isNavVisible} />
          }
        />
        

        <Route element={<ProtectedRoute />}>
              <Route path="/Recording" element={<Recording />} />
              <Route path="/documenttitle" element={<Documenttitle />} />
                <Route
                path="/documentchat"
                element={
                  <Documentchat
                    hideSideNav={hideSideNav}
                    isSideNavVisible={isNavVisible}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    hideSideNav={hideSideNav}
                    isSideNavVisible={isNavVisible}
                  />
                }
              />
              <Route
                path="/Upload"
                element={
                  <Upload hideSideNav={hideSideNav} isSideNavVisible={isNavVisible} />
                }
              />
              <Route
                  path="/Test"
                  element={
                    <Test hideSideNav={hideSideNav} isSideNavVisible={isNavVisible} />
                  }
                />
                <Route
                  path="/Question"
                  element={
                  <Question
                    hideSideNav={hideSideNav}
                    isSideNavVisible={isNavVisible}
                  />  
                  }
                />
          
                <Route path="/test-results/:testId" element={<TestDetails />} />
                <Route
                  path="/plan"
                  element={
                    <Plan hideSideNav={hideSideNav} isSideNavVisible={isNavVisible} />
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <CheckoutForm hideSideNav={hideSideNav} isSideNavVisible={isNavVisible} />
                  }
                />
          </Route>
                
          <Route path="/PDFViewer" element={<PDFViewer />} />
       
        
                  <Route
                    path="/Feedback"
                    element={
                      <Feedback
                        hideSideNav={hideSideNav}
                        isSideNavVisible={isNavVisible}
                      />
                    }
                  />
                  <Route path="/Footer" element={<Footer />} />
      </Routes>
      <button
        id="nav-menu-ctrl"
        onClick={ShowSideNav}
        style={{
          display:
            location.pathname == "/"
              ? "none"
              : location.pathname == "/documenttitle"
              ? "none"
              : location.pathname == "/Login"
              ? "none"
              : location.pathname == "/signup"
              ? "none"
              : "flex",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-menu"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
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
