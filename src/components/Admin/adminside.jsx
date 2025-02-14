import { useState, react, useCallback} from 'react'
import './adminside.css'
import { useNavigate } from "react-router-dom";

const Sidebar = ({gotodashy}) => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);
  return (
    <aside className="sidebar2">
        <div className="logo2">MY KASASI</div>
        <nav>
          <ol className="nav-items">
            <li className="nav-item" onClick={gotodashy}>📊 Dashboard</li>
            <li className="nav-item">👥 Users</li>
            <li className="nav-item">📈 Traffic</li>
            <li className="nav-item">🔔 Notifications</li>
            <li className="nav-item">⚙️ Settings</li>
          </ol>
        </nav>
        <div className="admin-info">
          <div className="admin-avatar">A</div>
          administrator
        </div>
      </aside>
  )
}

export default Sidebar