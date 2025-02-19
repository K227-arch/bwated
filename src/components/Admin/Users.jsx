import { useState } from 'react';
import Adminside from "./adminside";
import './Users.css';

const initialUsers = [
  { id: 1, name: 'John Doe', email: 'johndoe@example.com', plan: 'Daily', country: 'United States', joinedAt: 'Apr 1, 2022 2:00 PM', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'janesmith@example.com', plan: 'Daily', country: 'United Kingdom', joinedAt: 'Apr 2, 2022 4:30 PM', status: 'Active' },
  { id: 3, name: 'David Lee', email: 'davidlee@example.com', plan: 'Weekly', country: 'Japan', joinedAt: 'Apr 3, 2022 10:45 PM', status: 'Active' },
  { id: 4, name: 'Sarah Johnson', email: 'sarahjohnson@example.com', plan: 'Monthly', country: 'Uganda', joinedAt: 'Apr 4, 2022 6:15 PM', status: 'Suspended' },
  { id: 5, name: 'Michael Brown', email: 'michaelbrown@example.com', plan: 'Monthly', country: 'Germany', joinedAt: 'Apr 5, 2022 3:00 PM', status: 'Active' },
  { id: 6, name: 'Jessica Chen', email: 'jessicachen@example.com', plan: 'Free', country: 'United States', joinedAt: 'Apr 6, 2022 8:30 PM', status: 'Suspended' }
]

function App() {
  const [users] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEntries, setShowEntries] = useState(8)

  const filteredUsers = users.filter(user => 
    Object.values(user).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="user-container">
      <Adminside />
      <div className="user-wrapper">
        <header>
        <h1>All Users</h1>
        <div className="navigation">
          <span>Dashboard</span>
          <span className="separator">/</span>
          <span>User List</span>
        </div>
        
      </header>

      <div className="controls">
        <div className="search">
          <input
            type="text"
            placeholder="Search all columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="show-entries">
          <span>Show</span>
          <select 
            value={showEntries}
            onChange={(e) => setShowEntries(Number(e.target.value))}
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Info</th>
              <th>Subscription Plan</th>
              <th>Country</th>
              <th>Joined At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, showEntries).map(user => (
              <tr key={user.id}>
                <td className="info-cell">
                  <div className="user-info">
                    <div className="avatar">{user.name[0]}</div>
                    <div className="user-details">
                      <div className="name">{user.name}</div>
                      <div className="email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>{user.plan}</td>
                <td>{user.country}</td>
                <td>{user.joinedAt}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit">✏️</button>
                  <button className="delete">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      
    </div>
  )
}

export default App