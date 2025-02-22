import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "./Layout.jsx";
import ChatInterface from "./ChatInterface.jsx";
import Pop from "./Pop.jsx";
import "./Documentchat.css";


function App({ children, hideSideNav, isSideNavVisible }) {
  const navigate = useNavigate();
 const location = useLocation();
 
  // useEffect(() => {
  //   if (location.state?.success === true) {
  //     navigate("/upload");
  //   }
  // }, [location.state]);
  

  return (
    <div className="layout">
      {/* <Pop /> */}
      <div className="layout-main">
        <Layout isSideNavVisible={isSideNavVisible} hideSideNav={hideSideNav} />
      </div>
      <div className="layoutmain2">
        <ChatInterface isNavVisible={isSideNavVisible} docId={location.documentId} />
      </div>

      <main className="layout-content">{children}</main>
    </div>
  );
}

export default App;
