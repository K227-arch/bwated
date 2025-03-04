import { useState } from "react";
import Adminside from "./adminside";
import "./Packages.css";

const initialUsers = [
  { id: 1, Info: "BRIAN Wilson", plan: "Daily", Amount: 100, Payementmethod: "visa", status: "Active" },
  { id: 2, Info: "Daniel Lee", plan: "Weekly", Amount: 200, Payementmethod: "master card", status: "Pending" },
  { id: 3, Info: "Eva Hernadez", plan: "Monthly", Amount: 150, Payementmethod: "Mobile money", status: "Completed" }
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
          <h1>TRANSACTIONS</h1>
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
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="show-entries">
            <span>Show</span>
            <select value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))}>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Info</th>
                <th>Plan</th>
                <th>Amount ($)</th>
                <th>Payement method</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, showEntries).map((user) => (
                <tr key={user.id}>
                  <td>{user.Info}</td>
                  <td>{user.plan}</td>
                  <td>${user.Amount.toLocaleString()}</td>
                  <td>{user.Date}</td>
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



