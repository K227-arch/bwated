import { useState } from "react";
import "./generator.css";
import { useNavigate } from "react-router-dom";

function Generator() {
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [complexity, setComplexity] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [text, setText] = useState("");

  const questionCounts = ["5", "10", "15", "20", "25"];
  const complexityLevels = ["Structured", "Multichoice"];

  const navigate = useNavigate();

  // Handle question generation
  const handleGenerate = () => {
    if (!questionCount || !complexity) {
      alert("Please select all required fields!");
      return;
    }
    navigate("/Question", {
      state: {
        questionType,
        keywords,
        complexity,
        isFileUpload,
        questionCount,
      },
    });
  };

  return (
    <div className="generator-container">
      <div className="dropdown-group">
        {/* Question Count Dropdown */}
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

        {/* Complexity Dropdown */}
        <div className="dropdown-wrapper">
          <label htmlFor="complexity">Question Type:</label>
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

        {/* Keywords Input */}
        <div className="input-wrapper">
          <label htmlFor="keywords">Topics (optional):</label>
          <input
            id="keywords"
            type="text"
            placeholder="Enter keywords, comma-separated"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* File Upload Toggle */}
        <div className="input-wrapper">
          <label>
            <input
              type="checkbox"
              checked={isFileUpload}
              onChange={() => setIsFileUpload(!isFileUpload)}
            />
            Upload File Instead?
          </label>
        </div>

        {/* Text Input for Custom Text */}
        {isFileUpload ? (
          <div className="input-wrapper">
            <label htmlFor="fileUpload">Upload File:</label>
            <input type="file" id="fileUpload" />
          </div>
        ) : (
          <div className="input-wrapper">
            <label htmlFor="customText">Enter Custom Text:</label>
            <textarea
              id="customText"
              placeholder="Enter your text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>
        )}

        {/* Generate Button */}
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={!questionCount || !complexity}
        >
          Start Test
        </button>
      </div>
    </div>
  );
}

export default Generator;
