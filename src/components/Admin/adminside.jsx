import React, { useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminside.css";

const Adminside = ({ goToDashboard }) => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  return (
    <aside className="sidebar2">
      <div className="logo2">MY KASASI</div>
      <nav>
        <ol className="nav-items">
          <li className="nav-item" onClick={goToDashboard}>📊 Dashboards</li>
          <li className="nav-item" onClick={goto("/Users")}>👥 Users</li>
          <li className="nav-item" onClick={goto("/traffic")}>📈 Traffic</li>
          <li className="nav-item" onClick={goto("/notifications")}>🔔 Notifications</li>
          <li className="nav-item" onClick={goto("/settings")}>⚙️ Settings</li>
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
