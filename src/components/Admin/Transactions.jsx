import { useState, useEffect } from "react";
import Adminside from "./adminside";
import "./Packages.css";
import { supabase } from '@/lib/supabaseClient';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEntries, setShowEntries] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
    
        if (transactionsError) throw transactionsError;
    
        // Extract user auth IDs
        const userAuthIds = transactions.map((t) => t.user_id);
    
        // Fetch users separately
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('auth_id, email')
          .in('auth_id', userAuthIds);
    
        if (usersError) throw usersError;
    
        // Merge transactions with user emails
        const transactionsWithUsers = transactions.map((t) => ({
          ...t,
          user_email: users.find((u) => u.auth_id === t.user_id)?.email || null,
        }));
        // console.log(transactionsWithUsers);
        setTransactions(transactionsWithUsers);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    
    

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) =>
    Object.values(transaction).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
            <span>Transactions</span>
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

        {loading && <div>Loading transactions...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount ($)</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, showEntries).map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.user_email}</td>
                    <td>{transaction.type}</td>
                    <td>${transaction.amount.toFixed(2)}</td>
                    <td>{transaction.credits}</td>
                    <td>
                      <span className={`status ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
