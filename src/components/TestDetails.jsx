import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar'
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import './TestDetails.css';
 
function TestDetails({hideSideNav, isSideNavVisible}) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        // First fetch the test result with basic info
        const { data: testData, error: testError } = await supabase
          .from('test_results')
          .select(`
            *,
            documents:document_id (
              id,
              name,
              file_type,
              created_at
            )
          `)
          .eq('id', testId)
          .single();

        if (testError) throw testError;

        // Then fetch the questions with detailed information including options
        const { data: questions, error: questionsError } = await supabase
          .from('test_questions')
          .select(`
            id,
            question_number,
            question_text,
            question_type,
            correct_answer,
            user_answer,
            is_correct,
            options,
            metadata
          `)
          .eq('test_id', testId)
          .order('question_number', { ascending: true });

        if (questionsError) throw questionsError;

        // Process questions to parse options if they exist
        const processedQuestions = questions.map(question => {
          let parsedOptions = [];
          if (question.options) {
            try {
              // Handle both string and already parsed JSON
              parsedOptions = typeof question.options === 'string' 
                ? JSON.parse(question.options)
                : question.options;
            } catch (e) {
              console.error(`Failed to parse options for question ${question.id}:`, e);
            }
          }
          return {
            ...question,
            parsedOptions
          };
        });

        // Combine the data
        const combinedData = {
          ...testData,
          test_questions: processedQuestions,
          summary: {
            totalQuestions: questions.length,
            correctAnswers: questions.filter(q => q.is_correct).length,
            incorrectAnswers: questions.filter(q => !q.is_correct).length,
            byType: questions.reduce((acc, q) => {
              acc[q.question_type] = acc[q.question_type] || { total: 0, correct: 0 };
              acc[q.question_type].total++;
              if (q.is_correct) acc[q.question_type].correct++;
              return acc;
            }, {})
          }
        };
        console.log(combinedData)
        setTestData(combinedData);
      } catch (err) {
        console.error('Error fetching test details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId]);

  if (loading) return <div className="test-details-loading">Loading test details...</div>;
  if (error) return <div className="test-details-error">Error: {error}</div>;
  if (!testData) return <div className="test-details-error">Test not found</div>;

  return (


    <div className="layout">
      <div className="layout-main">
        <Header />
        <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav}/>
      </div>

      <div className="test-details-container">
      <header className="test-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{testData.documents?.name || 'Untitled Test'}</h1>
        <div className="test-summary">
          <div className="test-score">
            Score: {Math.round(testData.score)}%
          </div>
          <div className="test-stats">
            <div>Total Questions: {testData.summary.totalQuestions}</div>
            <div>Correct: {testData.summary.correctAnswers}</div>
            <div>Incorrect: {testData.summary.incorrectAnswers}</div>
          </div>
          <div className="test-date">
            Taken on: {new Date(testData.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="question-type-breakdown">
          {Object.entries(testData.summary.byType).map(([type, stats]) => (
            <div key={type} className="type-stat">
              <h4>{type}</h4>
              <p>{stats.correct}/{stats.total} correct</p>
            </div>
          ))}
        </div>
      </header>

      <div className="questions-list">
        {testData.test_questions.map((question, index) => (
          <div 
            key={question.id} 
            className={`question-card ${question.is_correct ? 'correct' : 'incorrect'}`}
          >
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question.question_text}</div>
            
            {question.parsedOptions && question.parsedOptions.length > 0 && (
              <div className="options-list">
                <strong>Options:</strong>
                <ul>
                  {question.parsedOptions.map((option, optIndex) => (
                    <li 
                      key={optIndex}
                      className={`
                        option 
                        ${option === question.user_answer ? 'selected' : ''}
                        ${option === question.correct_answer ? 'correct' : ''}
                      `}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="answers">
              <div className="user-answer">
                <strong>Your Answer:</strong>
                <span className={question.is_correct ? 'correct-text' : 'incorrect-text'}>
                  {question.user_answer || 'Not answered'}
                </span>
              </div>
              {!question.is_correct && (
                <div className="correct-answer">
                  <strong>Correct Answer:</strong>
                  <span>{question.correct_answer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    
  );
}

export default TestDetails;