import React, { useCallback, useState } from "react";
import Adminside from "./adminside";
import { useNavigate } from "react-router-dom";
import "./Admindashboard.css";

const Admindashboard = () => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  const [stats] = useState({
    newUsers: { value: 487, trend: 116.44, lastMonth: 225, thisYear: 187500 },
    newSubscribers: { value: 78, trend: -37.1, lastMonth: 124, thisYear: 759 },
    totalIncome: { value: 17855, trend: 2072.14, lastMonth: 822, thisYear: 87042 },
    totalSpending: { value: 856, trend: 277.09, lastMonth: 227, thisYear: 11510 },
  });

  const newUsers = [
    { id: 1, name: "John Doe", email: "johndoe@example.com", joinedAt: "Apr 1, 2022 2:00 PM", status: "Active", plan: "Free" },
    { id: 2, name: "Jane Smith", email: "janesmith@example.com", joinedAt: "Apr 2, 2022 4:30 PM", status: "Active", plan: "Free" },
    { id: 3, name: "David Lee", email: "davidlee@example.com", joinedAt: "Apr 3, 2022 10:45 PM", status: "Active", plan: "Weekly" },
  ];

  const recentTransactions = [
    { id: 1, name: "Brian Wilson", plan: "Daily", amount: 2.0, status: "Completed", date: "Apr 1, 2022 2:00 PM" },
    { id: 2, name: "Daniel Lee", plan: "Weekly", amount: 10.0, status: "Upcoming", date: "Apr 7, 2022 5:45 PM" },
    { id: 3, name: "Eva Hernandez", plan: "Monthly", amount: 40.0, status: "Pending", date: "Apr 4, 2022 6:15 PM" },
  ];

  return (
    <div className="Admindashboard">
      <Adminside />
      <div className="Admindashboard-wrapper">
        <header>
          <h1>ADMIN DASHBOARD</h1>
        </header>

        <div className="stats-grid">
          {Object.entries(stats).map(([key, data]) => (
            <div className="stat-card" key={key}>
              <div className="stat-header">
                ${data.value}
                <span className={`trend ${data.trend >= 0 ? "trend-up" : "trend-down"}`}>
                  {data.trend >= 0 ? "↑" : "↓"} {Math.abs(data.trend)}%
                </span>
              </div>
              <div className="stat-title">{key.replace(/([A-Z])/g, " $1").trim()}</div>
              <div className="comparison">
                <span>Last Month: ${data.lastMonth}</span>
                <span>This Year: ${data.thisYear}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="tables-section">
          <div className="table-container">
            <div className="table-header">
              <h2 className="table-title">New Users</h2>
              <button className="view-all" onClick={goto("/Users")}>View All</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined At</th>
                  <th>Status</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {newUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar"></div>
                        <div className="user-details">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.joinedAt}</td>
                    <td>
                      <span className={`status status-${user.status.toLowerCase()}`}>{user.status}</span>
                    </td>
                    <td>{user.plan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <div className="table-header">
              <h2 className="table-title">Recent Transactions</h2>
              <button className="view-all" onClick={goto("/Transactions")}>View All</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Info</th>
                  <th>Status</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar"></div>
                        <div className="user-details">
                          <span className="user-name">{transaction.name}</span>
                          <span className="user-email">
                            {transaction.plan} - ${transaction.amount}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status status-${transaction.status.toLowerCase()}`}>{transaction.status}</span>
                    </td>
                    <td>{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
