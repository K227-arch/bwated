import { useState, react} from 'react'
import './adminside.css'
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar2">
        <div className="logo2">MY KASASI</div>
        <nav>
          <ul className="nav-items">
            <li className="nav-item">📊 Dashboard</li>
            <li className="nav-item">👥 Users</li>
            <li className="nav-item">📈 Traffic</li>
            <li className="nav-item">🔔 Notifications</li>
            <li className="nav-item">⚙️ Settings</li>
          </ul>
        </nav>
        <div className="admin-info">
          <div className="admin-avatar">A</div>
          administrator
        </div>
      </aside>
  )
}

export default Sidebar