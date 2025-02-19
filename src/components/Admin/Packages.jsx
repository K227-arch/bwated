import { useState } from "react";
import Adminside from "./adminside";
import "./Packages.css";

const initialUsers = [
  { id: 1, name: "Free", email:"(Default)", price: 0, subscribers: 33, status: "Active" },
  { id: 2, name: "Daily", price: 2, subscribers: 20, status: "Active" },
  { id: 3, name: "Weekly", price: 10, subscribers: 10, status: "Active" },
  { id: 4, name: "Monthly", price: 40, subscribers: 0, status: "Suspended" },
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
          <h1>PACKAGES</h1>
          <div className="navigation">
            <span>Dashboard</span>
            <span className="separator">/</span>
            <span>Packages</span>
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
              <option value={0}>0</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plans</th>
                <th>Price ($)</th>
                <th>Subscribers</th>
                <th>Total Revenue ($)</th>
                <th>Payement Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, showEntries).map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>${user.price.toLocaleString()}</td>
                  <td>{user.subscribers.toLocaleString()}</td>
                  <td>${(user.price * user.subscribers).toLocaleString()}</td>
                  <td>
                    <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
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

