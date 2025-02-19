import { useState } from "react";
import Adminside from "./adminside";
import "./token.css";

const initialUsers = [
  { id: 1, name: "GPT-4", email: "(API key)", totalTokens: 4000000, tokensUsed: 3300000,  status: "Active" },
  { id: 2, name: "Realtime API", email: "(API key)", totalTokens: 2000000, tokensUsed: 300000, status: "Active" },
  { id: 3, name: "TTS", email: "(API key)", totalTokens: 2000000, tokensUsed: 200000, status: "Active" },
  { id: 4, name: "GPT-4o mini", email: "(API key)", totalTokens: 2000000, tokensUsed: 2000000, status: "Suspended" },
];

function App() {
  const [users] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEntries, setShowEntries] = useState(8);

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="user-container">
      <Adminside />
      <div className="user-wrapper">
        <header>
          <h1>TRAFFIC(TOKENS)</h1>
          <div className="navigation">
            <span>Dashboard</span>
            <span className="separator">/</span>
            <span>Tokens</span>
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
            <select value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))}>
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
                <th>Models</th>
                <th>Total Tokens (Purchased)</th>
                <th>Tokens Used</th>
                <th>Tokens Left</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, showEntries).map((user) => (
                <tr key={user.id}>
                  <td className="info-cell">
                    <div className="user-info">
                      
                      <div className="user-details">
                        <div className="name">{user.name}</div>
                        <div className="email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.totalTokens.toLocaleString()}</td>
                  <td>{user.tokensUsed.toLocaleString()}</td>
                  <td>{(user.totalTokens - user.tokensUsed).toLocaleString()}</td>
                  <td>
                    <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
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
  );
}

export default App;
