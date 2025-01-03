import { useState } from 'react'
import './question.css'

function App() {
  const [questionType, setQuestionType] = useState('multiple')
  const [score, setScore] = useState(null)
  const [currentAnswer, setCurrentAnswer] = useState('')
  
  const multipleChoiceQuestion = {
    question: "What is one of the core focuses of the React Native Fundamentals section?",
    options: [
      "Implementing third-party tools for authentication",
      "Creating pixel-perfect UIs for both iOS and Android devices",
      "Building desktop applications only",
      "Learning the HTML structure for mobile apps"
    ],
    correctAnswer: 1
  }

  const structuredQuestion = {
    question: "Explain how React Native differs from React for web development?",
    correctKeywords: ['mobile', 'native', 'components', 'platform']
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (questionType === 'multiple') {
      setScore(parseInt(currentAnswer) === multipleChoiceQuestion.correctAnswer ? 100 : 0)
    } else {
      const words = currentAnswer.toLowerCase().split(' ')
      const matches = structuredQuestion.correctKeywords.filter(keyword => 
        words.includes(keyword.toLowerCase())
      )
      setScore(Math.round((matches.length / structuredQuestion.correctKeywords.length) * 100))
    }
  }

  const handleReset = () => {
    setScore(null)
    setCurrentAnswer('')
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>Quiz Application</h1>
        <div className="question-type-selector">
          <button 
            className={questionType === 'multiple' ? 'active' : ''}
            onClick={() => {
              setQuestionType('multiple')
              handleReset()
            }}
          >
            Multiple Choice
          </button>
          <button 
            className={questionType === 'structured' ? 'active' : ''}
            onClick={() => {
              setQuestionType('structured')
              handleReset()
            }}
          >
            Structured Question
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="question-container">
          <h2>
            {questionType === 'multiple' 
              ? multipleChoiceQuestion.question 
              : structuredQuestion.question}
          </h2>

          {questionType === 'multiple' ? (
            <div className="options-container">
              {multipleChoiceQuestion.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={currentAnswer === index.toString()}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />
                  <span4>{option}</span4>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows="4"
            />
          )}
        </div>

        <div className="button-container">
          <button type="submit" className="submit-btn">
            Submit Answer
          </button>
          <button type="button" onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>

        {score !== null && (
          <div className="result-container">
            <h3>Result</h3>
            <p className="score">Score: {score}%</p>
            {questionType === 'structured' && (
              <p className="hint">
                Hint: Include keywords like {structuredQuestion.correctKeywords.join(', ')}
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  )
}

export default App