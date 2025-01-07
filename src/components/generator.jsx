import { useState } from "react";
import "./generator.css";
import { useNavigate } from "react-router";

function Generator() {
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [complexity, setComplexity] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [text, setText] = useState("");

  
  const questionCounts = ["5", "10", "15", "20", "25"];
  const complexityLevels = ["Easy", "Medium", "Hard", "Mixed"];
  
  const navigate = useNavigate()
  
  // Handle the generation of questions
  const handleGenerate = () => {
    // Validate required fields
    navigate("/Question",{state:{
      questionType,
      keywords,
      complexity,
      isFileUpload,
      questionCount,
    }})
 
  };

  return (
    <div className="generator-container">
      <div className="dropdown-group">
        {/* Dropdown for Question Type */}
        
        {/* Dropdown for Question Count */}
        <div className="dropdown-wrapper">
          <label htmlFor="questionCount">How many Questions:</label>
          <select
            id="questionCount"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
          >
            <option value="">-- Please select an option --</option>
            {questionCounts.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for Complexity */}
        <div className="dropdown-wrapper">
          <label htmlFor="complexity">Question Complexity (optional):</label>
          <select
            id="complexity"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
          >
            <option value="">-- Please select an option --</option>
            {complexityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Keywords Input (Optional) */}
        <div className="input-wrapper">
          <label htmlFor="keywords">Keywords (optional):</label>
          <input
            id="keywords"
            type="text"
            placeholder="Enter keywords, comma-separated"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* File Upload Toggle */}
        

        {/* Text Input for Custom Text */}
        

        {/* Generate Button */}
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={!questionCount }
        >
          Start test
        </button>
      </div>
    </div>
  );
}

export default Generator;
