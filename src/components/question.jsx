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
          <button onClick={() => navigate('/test')}>Return to Test Generator</button>
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

  const compareStructuredAnswers = (userAnswer, correctAnswer) => {
    if (!userAnswer || !correctAnswer) return 0;

    // Preprocess answers
    const preprocessAnswer = (answer) => {
      return answer
        .toLowerCase()
        .replace(/[.,;:!?]/g, '')  // Remove punctuation
        .split(/\s+/)  // Split into words
        .filter(word => word.length > 1);  // Remove very short words
    };

    const userWords = preprocessAnswer(userAnswer);
    const correctWords = preprocessAnswer(correctAnswer);

    // Calculate similarity metrics
    const keywordMatches = correctWords.filter(word => 
      userWords.includes(word) && word.length > 3
    );

    // Calculate coverage and precision
    const coverageScore = keywordMatches.length / correctWords.length;
    const precisionScore = keywordMatches.length / userWords.length;

    // Combine scores with different weights
    const finalScore = (
      (coverageScore * 0.6) +  // 60% weight to coverage
      (precisionScore * 0.4)   // 40% weight to precision
    ) * 100;

    // Additional context-aware scoring
    const contextualBonus = calculateContextualBonus(userAnswer, correctAnswer);

    return Math.min(finalScore + contextualBonus, 100);
  };

  const calculateContextualBonus = (userAnswer, correctAnswer) => {
    // Implement more advanced NLP-like comparison
    const userSentences = userAnswer.split(/[.!?]+/).length;
    const correctSentences = correctAnswer.split(/[.!?]+/).length;

    // Bonus for structural similarity
    let structuralBonus = 0;
    if (userSentences === correctSentences) {
      structuralBonus += 5;
    }

    // Check for key phrases
    const keyPhrases = correctAnswer
      .toLowerCase()
      .match(/\b([a-z]{4,})\b/g) || [];
    
    const matchedPhrases = keyPhrases.filter(phrase => 
      userAnswer.toLowerCase().includes(phrase)
    );

    structuralBonus += matchedPhrases.length * 3;

    return Math.min(structuralBonus, 10);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (question.type === 'multiple') {
        if (userAnswers[index] === question.answer) {
          correctAnswers++;
        }
      } else {
        // Use the new structured answer comparison
        const score = compareStructuredAnswers(
          userAnswers[index], 
          question.answer
        );
        
        // Consider the answer correct if score is above 60%
        if (score >= 60) {
          correctAnswers++;
        }
      }
    });
    return { 
      score: (correctAnswers / questions.length) * 100, 
      correctAnswers 
    };
  };

  const handleShowResults = async () => {
    const { score, correctAnswers } = calculateScore();
    setScore(score);
    setShowResults(true);
    
    try {
      const performanceResults = await saveTestResults(score, correctAnswers);
      
      // Optionally, you can store or display additional performance metrics
      if (performanceResults) {
        console.log('Performance Metrics:', performanceResults.performanceMetrics);
      }
    } catch (error) {
      console.error('Error in showing results:', error);
    }
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
      // Calculate detailed scoring
      const detailedScores = questions.map((question, index) => {
        if (question.type === 'multiple') {
          return {
            type: 'multiple',
            isCorrect: userAnswers[index] === question.answer,
            score: userAnswers[index] === question.answer ? 100 : 0
          };
        } else {
          const similarityScore = compareStructuredAnswers(
            userAnswers[index], 
            question.answer
          );
          return {
            type: 'structured',
            isCorrect: similarityScore >= 60,
            score: similarityScore
          };
        }
      });

      // Calculate weighted overall score
      const weightedScores = detailedScores.map(score => score.score);
      const averageScore = weightedScores.reduce((a, b) => a + b, 0) / weightedScores.length;

      // Calculate performance metrics
      const multipleChoiceQuestions = detailedScores.filter(q => q.type === 'multiple');
      const structuredQuestions = detailedScores.filter(q => q.type === 'structured');

      const performanceMetrics = {
        multipleChoice: {
          total: multipleChoiceQuestions.length,
          correct: multipleChoiceQuestions.filter(q => q.isCorrect).length,
          accuracy: (multipleChoiceQuestions.filter(q => q.isCorrect).length / multipleChoiceQuestions.length) * 100
        },
        structuredQuestions: {
          total: structuredQuestions.length,
          correct: structuredQuestions.filter(q => q.isCorrect).length,
          averageSimilarity: structuredQuestions.reduce((a, q) => a + q.score, 0) / structuredQuestions.length
        }
      };

      // First, insert the test result
      const { data: testResult, error: testError } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          score: averageScore,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          test_data: {
            detailedScores,
            performanceMetrics
          },
          document_id: location.state?.documentId,
          metadata: {
            test_duration: calculateTestDuration(),
            test_type: 'generated',
            test_version: '1.0',
            question_types: {
              multiple: multipleChoiceQuestions.length,
              structured: structuredQuestions.length
            }
          }
        })
        .select()
        .single();

      if (testError) throw testError;

      // Then, insert all questions
      const questionsToInsert = questions.map((question, index) => {
        const detailedScore = detailedScores[index];
        return {
          test_id: testResult.id,
          question_number: index + 1,
          question_text: question.question,
          question_type: question.type,
          correct_answer: question.answer,
          user_answer: userAnswers[index] || null,
          is_correct: detailedScore.isCorrect,
          similarity_score: detailedScore.type === 'structured' ? detailedScore.score : null,
          options: question.type === 'multiple' ? question.options : null,
          metadata: {
            category: question.category || 'general',
            difficulty: question.difficulty || 'medium'
          }
        };
      });

      const { error: questionsError } = await supabase
        .from('test_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      // Return additional performance insights
      return {
        averageScore,
        performanceMetrics
      };

    } catch (error) {
      console.error('Error saving test results:', error);
      setSaveError('Failed to save test results');
    } finally {
      setIsSaving(false);
    }
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
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = question.type === 'multiple' 
                ? userAnswer === question.answer
                : compareStructuredAnswers(userAnswer, question.answer) >= 60;

              return (
                <div key={index} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <h4>Question {index + 1}</h4>
                  <p>{question.question}</p>
                  <div className="answer-comparison">
                    <div className="user-answer">
                      <strong>Your Answer:</strong>
                      <p>{userAnswer || 'Not answered'}</p>
                    </div>
                    <div className="correct-answer">
                      <strong>Correct Answer:</strong>
                      <p>{question.answer}</p>
                    </div>
                    {question.type !== 'multiple' && (
                      <div className="answer-score">
                        <strong>Answer Similarity:</strong>
                        <p>
                          {compareStructuredAnswers(userAnswer, question.answer).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
