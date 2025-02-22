import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Adminside from "./adminside";
import './Users.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEntries, setShowEntries] = useState(8);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profiles, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: profile.email || '',
        plan: profile.subscription_plan || 'Free',
        country: profile.country || 'Unknown',
        joinedAt: new Date(profile.created_at).toLocaleString(),
        status: profile.is_active ? 'Active' : 'Suspended'
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    Object.values(user).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchUsers}>Retry</button>
          </div>
        )}

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
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default App;