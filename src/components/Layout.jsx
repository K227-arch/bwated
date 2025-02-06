import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

function App({ children, hideSideNav, isSideNavVisible }) {
  return (
    <div className="layout">
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      <div className="layout-main">
        <Header />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
export default App;
