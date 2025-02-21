import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'
import './dashboard.css';
import { useNavigate } from "react-router";
import { supabase } from '@/lib/supabaseClient'; // Fix typo in import

function App({hideSideNav, isSideNavVisible}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch current user and their documents
  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        setUser(user);

        // Fetch documents for current user
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (docsError) throw docsError;

        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDocuments();
  }, []);

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gotoDocumentchat=()=>{
    navigate("/Documentchat")
  }
 
  const handleChatClick = () => {
     navigate("/upload")
  }

  const handleTestClick = () => {
    navigate("/Test")
  }

  return (
    <div className="layout">
      <div className="layout-main">
        <Header />
        <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav}/>
      </div>

      <div className="chat-container2-dashboard">
        <header className="chat-header">
          <h1>Good morning, {user?.user_metadata?.full_name || 'User'}</h1>
          
          <div className="container4">
                <div className="layout-main">
                  <Header />
                </div>
                <h1 className="title2"></h1>
                <div className="cards-container">
                  <div className="card" onClick={handleChatClick}>
                    <div className="card-icon">💬</div>
                    <h2>Start a Chat</h2>
                    <p>Need to study? Enter a chat and ask about anything you're not sure about.</p>
                  </div>

                  <div className="card" onClick={handleTestClick}>
                    <div className="card-icon">📝</div>
                    <h2>Take a Test</h2>
                    <p>Feeling confident? Test your knowledge with some multiple choice questions.</p>
                  </div>
                </div>

                <p className="terms">
                  By uploading a document, you agree to and have read our{' '}
                  <a href="#" className="terms-link">Terms and Conditions</a>.
                </p>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-buttons">
            <button className="filter-btn active">PDFs & Quizzes</button>
          </div>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input4"
            />
            <div className="search-icon">🔍</div>
          </div>

          <div className="sort-dropdown">
            <select className="sort-select">
              <option>Most recent</option>
            </select>
          </div>
        </div>

        <div className="chat-grid">
          {loading ? (
            <div className="loading">Loading documents...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="no-documents">
              No documents found. Upload a document to get started!
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="chat-card" onClick={() => navigate(`/chat/${doc.id}`)}>
                <div className="chat-preview">
                  <h3>{doc.name || 'Untitled'}</h3>
                  <div className="date">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  <div className="document-type">
                    {doc.file_type === 'pdf' ? '📄' : '📁'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;