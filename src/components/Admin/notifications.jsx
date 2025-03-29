import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Adminside from "./adminside";
import { supabase } from '@/lib/supabaseClient';
import './notifications.css';

function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('category, message, created_at');

      if (error) {
        console.error('Error fetching feedback:', error);
      } else {
        setFeedbacks(data);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="notifications-container">
      <Adminside />
      <div className="notifications-wrapper">
        <div className="header-noti">
          <h1>Notifications</h1>
          <nav>
            <span>Feedback</span>
            <span className="separator">›</span>
            <span>Support Center</span>
          </nav>
        </div>

        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by id"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <div className="show-entries">
            <span>Show</span>
            <select>
              <option>8</option>
              <option>16</option>
              <option>24</option>
            </select>
          </div>
        </div>

        <div className="tickets">
          {feedbacks.map((feedback, index) => (
            <div key={index} className="ticket-card">
              <h3 className="ticket-title">{feedback.category}</h3>
              <p className="ticket-message">{feedback.message}</p>
              <div className="ticket-footer">
                <div className="time">Created at: {new Date(feedback.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>  
      </div>
    </div>
  )
}

export default App