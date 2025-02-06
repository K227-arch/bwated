import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './feedback.css'

function App({ hideSideNav, isSideNavVisible }) {
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (category && message) {
      console.log('Feedback submitted:', { category, message })
      // Reset form
      setCategory('')
      setMessage('')
    }
  }

  return (
    <div className="feedback-container">
        <Header />
        <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />

      <h1 className="feedback-title">Platform feedback</h1>
      <p className="feedback-description">
        We would love to hear your thoughts on how we can improve bwarted,
        so we can better help you achieve your dream grade!
      </p>

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
  )
}

export default App
