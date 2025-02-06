import React, { useState } from "react";
import Layout from "./Layout.jsx";
import ChatInterface from "./ChatInterface.jsx";
import Pop from "./Pop.jsx";
import "./Documentchat.css";

function App({ children,hideSideNav, isSideNavVisible }) {
 
  return (
    <div className="layout">
      <Pop />
      <div className="layout-main">
        <Layout isSideNavVisible={isSideNavVisible} hideSideNav={hideSideNav} />
      </div>
      <div className="layoutmain2">
        <ChatInterface  />
      </div>

      <main className="layout-content">{children}</main>
    </div>
  );
}
export default App;
