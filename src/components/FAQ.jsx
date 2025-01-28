import { useState } from 'react'
import './FAQ.css'

function App() {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqData = [
    {
      question: "How does Bwarted help me prepare for my exams?",
      answer: "Bwarted provides comprehensive study materials, practice tests, and personalized learning paths to help you effectively prepare for your exams."
    },
    {
      question: "What makes Bwarted different from other study platforms?",
      answer: "Educato offers unique features like adaptive learning, real-time progress tracking, and expert-curated content tailored to your specific needs."
    },
    {
      question: "How can I track my progress on Bwarted?",
      answer: "You can monitor your progress through detailed analytics, performance metrics, and personalized dashboards that show your improvement over time."
    },
    {
      question: "Is there a community or support system on Bwarted?",
      answer: "Yes, Bwarted has a vibrant community of learners and educators, along with 24/7 support to help you with any questions or concerns."
    },
    {
      question: "Can I use Bwarted on my phone or tablet?",
      answer: "Yes, Bwarted is fully responsive and available on all devices through our mobile app and web platform."
    }
  ]

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="faq-container">
      <h1 className="faq-title">FAQ</h1>
      {faqData.map((faq, index) => (
        <div key={index} className="faq-item">
          <div 
            className="faq-question"
            onClick={() => toggleFAQ(index)}
          >
            {faq.question}
            <span>{activeIndex === index ? '−' : '+'}</span>
          </div>
          <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  )
}

export default App