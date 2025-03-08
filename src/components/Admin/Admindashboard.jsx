import React, { useCallback, useState, useEffect } from "react";
import Adminside from "./adminside";
import { useNavigate } from "react-router-dom";
import "./Admindashboard.css";
import { supabase } from '@/lib/supabaseClient';

const Admindashboard = () => {
  const navigate = useNavigate();
  const goto = useCallback((path) => () => navigate(path), [navigate]);

  const [stats, setStats] = useState({
    newUsers: { value: 0, trend: 0, lastMonth: 0, thisYear: 0 },
    newSubscribers: { value: 0, trend: 0, lastMonth: 0, thisYear: 0 }, 
    totalIncome: { value: 0, trend: 0, lastMonth: 0, thisYear: 0 },
    totalSpending: { value: 0, trend: 0, lastMonth: 0, thisYear: 0 }
  });

  const [newUsers, setNewUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent users
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (usersError) throw usersError;
        setNewUsers(users.map(user => ({
          id: user.id,
          name: user.full_name || 'Anonymous',
          email: user.email,
          joinedAt: new Date(user.created_at).toLocaleString(),
          status: user.status || 'Active',
          plan: user.subscription_tier || 'Free'
        })));

        // Fetch transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
    
        if (transactionsError) throw transactionsError;
    
        // Extract user auth IDs
        const userAuthIds = transactions.map((t) => t.user_id);
    
        // Fetch users separately
        const { data: transactionUsers, error: usersError2 } = await supabase
          .from('users')
          .select('auth_id, email')
          .in('auth_id', userAuthIds);
    
        if (usersError2) throw usersError2;
    
        // Merge transactions with user emails
        const transactionsWithUsers = transactions.map((t) => ({
          ...t,
          user_email: transactionUsers.find((u) => u.auth_id === t.user_id)?.email || null,
        }));

        setRecentTransactions(transactionsWithUsers.slice(0,3).map(tx => ({
          id: tx.id,
          name: tx.user_email || 'Anonymous',
          plan: tx.type,
          amount: tx.amount,
          status: tx.status,
          date: new Date(tx.created_at).toLocaleString()
        })));

        // Calculate stats
        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisYearStart = new Date(now.getFullYear(), 0, 1);

        // Users stats
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact' });

        const { count: lastMonthUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .gte('created_at', lastMonthStart.toISOString());

        // Transactions stats
        const { data: allTransactions } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('status', 'Completed');

        const thisMonthIncome = allTransactions
          .filter(tx => new Date(tx.created_at) >= lastMonthStart)
          .reduce((sum, tx) => sum + tx.amount, 0);

        const lastMonthIncome = allTransactions
          .filter(tx => {
            const txDate = new Date(tx.created_at);
            return txDate >= new Date(now.getFullYear(), now.getMonth() - 2, 1) &&
                   txDate < lastMonthStart;
          })
          .reduce((sum, tx) => sum + tx.amount, 0);

        const thisYearIncome = allTransactions
          .filter(tx => new Date(tx.created_at) >= thisYearStart)
          .reduce((sum, tx) => sum + tx.amount, 0);

        setStats({
          newUsers: {
            value: totalUsers || 0,
            trend: lastMonthUsers ? ((lastMonthUsers / totalUsers) * 100) - 100 : 0,
            lastMonth: lastMonthUsers || 0,
            thisYear: totalUsers || 0
          },
          newSubscribers: {
            value: Math.floor(totalUsers * 0.2) || 0,
            trend: 0,
            lastMonth: Math.floor(lastMonthUsers * 0.2) || 0,
            thisYear: Math.floor(totalUsers * 0.2) || 0
          },
          totalIncome: {
            value: Math.round(thisMonthIncome),
            trend: lastMonthIncome ? ((thisMonthIncome / lastMonthIncome) * 100) - 100 : 0,
            lastMonth: Math.round(lastMonthIncome),
            thisYear: Math.round(thisYearIncome)
          },
          totalSpending: {
            value: Math.round(thisMonthIncome * 0.1),
            trend: 0,
            lastMonth: Math.round(lastMonthIncome * 0.1),
            thisYear: Math.round(thisYearIncome * 0.1)
          }
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
                  {data.trend >= 0 ? "↑" : "↓"} {Math.abs(data.trend).toFixed(2)}%
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
