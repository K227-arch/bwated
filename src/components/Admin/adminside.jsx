import React, { useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminlogo2 from "../../assets/bwated-white.png";
import "./adminside.css";

const Adminside = ({ goToDashboard }) => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  return (
    <aside className="sidebar2">
      <div className="logo2">
        <img
                    src={adminlogo2}
                    className="adminlogo2"
                    onClick={goto("/Documenttitle")}
                    alt="Logo"
                    aria-label="Go to home"
          />
      </div>
      <nav>
        <ol className="nav-items">
          <li className="nav-item" onClick={goto("/Admindashboard")}>📊 Dashboards</li>
          <li className="nav-item" onClick={goto("/Users")}>👥 Users</li>
          <li className="nav-item" onClick={goto("/Packages")}>🚀 Packages</li>
          <li className="nav-item" onClick={goto("/Token")}>📈 Traffic</li>
          <li className="nav-item" onClick={goto("/notifications")}>🔔 Notifications</li>
         
        </ol>
      </nav>
      <div className="admin-info">
        <div className="admin-avatar">A</div>
        Administrator
      </div>
    </aside>
  );
};

export default Adminside;
