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

  const questionTypes = ["Objectives", "Structured questions"];
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
        <div className="dropdown-wrapper">
          <label htmlFor="questionType">Select Question Style:</label>
          <select
            id="questionType"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="">-- Please select an option --</option>
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

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
        <div className="file-upload-wrapper">
          <label>
            <input
              type="checkbox"
              checked={isFileUpload}
              onChange={(e) => setIsFileUpload(e.target.checked)}
            />
            Upload File
          </label>
        </div>

        {/* Text Input for Custom Text */}
        {isFileUpload && (
          <div className="input-wrapper">
            <label htmlFor="textInput">Enter Text:</label>
            <textarea
              id="textInput"
              placeholder="Paste your text here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}

        {/* Generate Button */}
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={!questionType || !questionCount }
        >
          Generate Questions
        </button>
      </div>
    </div>
  );
}

export default Generator;
