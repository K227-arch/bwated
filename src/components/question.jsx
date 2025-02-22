import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./question.css";
import { supabase } from "@/lib/supabaseClient";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Get questions from navigation state
  const questions = location.state?.questions;

  // Validate questions data
  useEffect(() => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      setError('No valid questions found. Please generate a test first.');
    }
  }, [questions]);

  // Fetch user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

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
    return { score: (correctAnswers / questions.length) * 100, correctAnswers };
  };

  const handleShowResults = async () => {
    const { score, correctAnswers } = calculateScore();
    setScore(score);
    setShowResults(true);
    await saveTestResults(score, correctAnswers);
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

  const saveTestResults = async (finalScore, correctAnswers) => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveError(null);

    try {
      // First, insert the test result
      const { data: testResult, error: testError } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          score: finalScore,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          test_data: {}, // We'll store questions separately now
          document_id: location.state?.documentId,
          metadata: {
            test_duration: calculateTestDuration(),
            test_type: 'generated',
            test_version: '1.0'
          }
        })
        .select()
        .single();

      if (testError) throw testError;

      // Then, insert all questions
      const questionsToInsert = questions.map((question, index) => ({
        test_id: testResult.id,
        question_number: index + 1,
        question_text: question.question,
        question_type: question.type,
        correct_answer: question.answer,
        user_answer: userAnswers[index] || null,
        is_correct: question.type === 'multiple' 
          ? userAnswers[index] === question.answer
          : calculateAnswerCorrectness(userAnswers[index], question.answer),
        options: question.type === 'multiple' ? question.options : null,
        metadata: {
          category: question.category || 'general',
          difficulty: question.difficulty || 'medium'
        }
      }));

      const { error: questionsError } = await supabase
        .from('test_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

    } catch (error) {
      console.error('Error saving test results:', error);
      setSaveError('Failed to save test results');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAnswerCorrectness = (userAnswer, correctAnswer) => {
    if (!userAnswer) return false;
    const userAnswerLower = userAnswer.toLowerCase();
    const correctAnswerLower = correctAnswer.toLowerCase();
    const keyTerms = correctAnswerLower.split(' ').filter(word => word.length > 4);
    const matchCount = keyTerms.filter(term => userAnswerLower.includes(term)).length;
    return matchCount / keyTerms.length >= 0.5;
  };

  const calculateTestDuration = () => {
    // Add test duration calculation logic if needed
    return 0;
  };

  if (showResults) {
    return (
      <div className="quiz-wrapper">
        <div className="quiz-container results">
          <h2>Test Results</h2>
          {saveError && (
            <div className="error-message">
              {saveError}
            </div>
          )}
          {isSaving && (
            <div className="saving-message">
              Saving your results...
            </div>
          )}
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

          {isSaving ? (
            <div className="saving-indicator">
              <div className="spinner"></div>
              <p>Saving your test results...</p>
            </div>
          ) : saveError ? (
            <div className="error-message">
              <p>{saveError}</p>
              <button onClick={() => saveTestResults(score, correctAnswers)}>
                Retry Saving
              </button>
            </div>
          ) : (
            <div className="success-message">
              <p>Test results saved successfully!</p>
            </div>
          )}
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
