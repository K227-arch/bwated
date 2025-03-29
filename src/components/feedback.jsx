import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { supabase } from "@/lib/supabaseClient"; // Import supabase client
import "./feedback.css";

function App({ hideSideNav, isSideNavVisible }) {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null); // State for error handling

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (category && message) {
      try {
        // Save feedback to Supabase
        const { error } = await supabase
          .from("feedback") // Assuming the table name is 'feedback'
          .insert([{ category, message }]);

        if (error) throw error;

        console.log("Feedback submitted:", { category, message });
        // Reset form
        setCategory("");
        setMessage("");
      } catch (err) {
        console.error("Error submitting feedback:", err);
        setError("Failed to submit feedback. Please try again."); // Set error message
      }
    }
  };

  return (
    <div className="feedback-wrapper">
      <div className="feedback-container">
        <Header />
        <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />

        <h1 className="feedback-title">Platform feedback</h1>
        <p className="feedback-description">
          We would love to hear your thoughts on how we can improve bwarted, so
          we can better help you achieve your dream grade!
        </p>

        {error && <p className="error-message">{error}</p>} {/* Display error message */}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="category" className="feedback-label">
              Feedback category
            </label>
            <select
              id="category"
              className="feedback-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Choose the type of feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="feedback-label">
              Your message
            </label>
            <textarea
              id="message"
              className="feedback-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please let us know what you think or if there are issues ..."
              required
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!category || !message}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
