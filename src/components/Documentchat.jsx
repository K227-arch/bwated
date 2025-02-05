import React, { useState } from "react";
import Layout from "./Layout.jsx";
import ChatInterface from "./ChatInterface.jsx";
import Pop from "./Pop.jsx";
import "./Documentchat.css";

function App({ children }) {
  const [isNavVisible, setNavVisible] = useState(false);

  /**
   * Function Event Pulled from the chartInterface
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

  return (
    <div className="layout">
      <Pop />
      <div className="layout-main">
        <Layout isSideNavVisible={isNavVisible} hideSideNav={hideSideNav} />
      </div>
      <div className="layoutmain2">
        <ChatInterface willShowSideNav={ShowSideNav} />
      </div>

      <main className="layout-content">{children}</main>
    </div>
  );
}
export default App;
