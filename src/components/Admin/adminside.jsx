import React, { useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // Import supabase for signout
import adminlogo2 from "../../assets/bwated-white.png";
import "./adminside.css";

const Adminside = ({ goToDashboard }) => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut(); // Sign out from Supabase
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/Login"); // Redirect to login page after sign out
    }
  };

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
          <li className="nav-item" onClick={goto("/Transactions")}>💳 Transactions</li>
          <li className="nav-item" onClick={goto("/Packages")}>🚀 Packages</li>
          <li className="nav-item" onClick={goto("/Token")}>📈 Traffic</li>
          <li className="nav-item" onClick={goto("/notifications")}>🔔 Notifications</li>
          <li className="nav-item" onClick={handleSignOut}>🚪 Sign Out</li> {/* Sign out option */}
        </ol>
      </nav>
      <div className="admin-info">
        <div className="admin-avatar">A</div>
        Administrators
      </div>
    </aside>
  );
};

export default Adminside;
