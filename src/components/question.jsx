import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./question.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  // Get questions from navigation state
  const questions = location.state?.questions;

  // Validate questions data
  useEffect(() => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      setError('No valid questions found. Please generate a test first.');
    }
  }, [questions]);

  if (error || !questions) {
    return (
      <div className="quiz-wrapper">
        <div className="error-container">
          <h2>Error: {error || 'No questions available'}</h2>
          <button onClick={() => navigate('/testscreen')}>Return to Test Generator</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSubmit = (answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (question.type === 'multiple') {
        if (userAnswers[index] === question.answer) {
          correctAnswers++;
        }
      } else {
        const userAnswer = userAnswers[index]?.toLowerCase() || '';
        const correctAnswer = question.answer.toLowerCase();
        const keyTerms = correctAnswer.split(' ').filter(word => word.length > 4);
        const matchCount = keyTerms.filter(term => userAnswer.includes(term)).length;
        if (matchCount / keyTerms.length >= 0.5) { // 50% match threshold
          correctAnswers++;
        }
      }
    });
    return (correctAnswers / questions.length) * 100;
  };

  const handleShowResults = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (showResults) {
    return (
      <div className="quiz-wrapper">
        <div className="quiz-container results">
          <h2>Test Results</h2>
          <div className="score-display">
            <h3>Your Score: {score.toFixed(1)}%</h3>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${score}%` }}></div>
            </div>
          </div>
          
          <div className="answers-review">
            {questions.map((question, index) => (
              <div key={index} className="question-review">
                <h4>Question {index + 1}</h4>
                <p>{question.question}</p>
                <div className="answer-comparison">
                  <div className="user-answer">
                    <strong>Your Answer:</strong>
                    <p>{userAnswers[index] || 'Not answered'}</p>
                  </div>
                  <div className="correct-answer">
                    <strong>Correct Answer:</strong>
                    <p>{question.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={() => navigate('/testscreen')}>Generate New Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-wrapper">
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
          <div className="progress-indicator">
            {questions.map((_, index) => (
              <div 
                key={index} 
                className={`indicator ${index === currentQuestionIndex ? 'active' : ''} 
                           ${userAnswers[index] ? 'answered' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="question-container">
          <h3>{currentQuestion.question}</h3>

          {currentQuestion.type === 'multiple' ? (
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${userAnswers[currentQuestionIndex] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSubmit(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerSubmit(e.target.value)}
              placeholder="Type your answer here..."
              rows="4"
            />
          )}
        </div>

        <div className="navigation-buttons">
          <button 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button 
              onClick={handleShowResults}
              className="submit-button"
              disabled={Object.keys(userAnswers).length === 0}
            >
              Show Results
            </button>
          ) : (
            <button 
              onClick={handleNext}
              disabled={!userAnswers[currentQuestionIndex]}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
