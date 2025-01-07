import { useState, useEffect } from "react";
import "./generator.css";
import { useNavigate } from "react-router";
import OpenAI from "openai";
import React from "react";

function Generator() {  
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [complexity, setComplexity] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [text, setText] = useState("");
  const [pdfContent, setpdfContent ] = useState('')

  
  const questionCounts = ["5", "10", "15", "20", "25"];
  const complexityLevels = ["Easy", "Medium", "Hard", "Mixed"];
  
const apiKey = import.meta.env.VITE_OPENAI_KEY;
const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  
  const navigate = useNavigate()
  
  // Handle the generation of questions
  const handleGenerate = async () => {
    // Validate required fields
    // navigate("/Question",{state:{
    //   questionType,
    //   keywords,
    //   complexity,
    //   isFileUpload,
    //   questionCount,
    // }})


const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
      { role: "system", content: "You are an AI assistant that creates tests based on uploaded documents." },
      {
          role: "user",
          content: `
        Create a test based on the following document content:
        ---
        ${pdfContent}
        ---

        Use the following parameters:
        - questionType: "multiple" (for multiple-choice questions with 4 options) or "structured" (for open-ended questions).
        - keywords: Focus on key topics extracted from the document (e.g., headers, repeated terms, or important concepts).
        - complexity: Either "easy", "medium", or "hard".
        - questionCount: Number of questions to generate.

        Return the test in the following JavaScript object format:
        {
          "questions": [
              {
                  "question": "What is recursion in programming?",
                  "type": "multiple",
                  "options": [
                      "A function calling itself",
                      "A loop inside a loop",
                      "A function without parameters",
                      "A method to iterate arrays"
                  ],
                  "answer": "A function calling itself"
              },
              {
                  "question": "Explain the concept of memoization.",
                  "type": "structured",
                  "answer": "Memoization is a technique used to optimize programs by storing the results of expensive function calls and reusing them when the same inputs occur again."
              }
          ]
        }`
      },
      {
          role: "user",
          content: `
            Here are the test parameters:
            - questionType: ${questionType}
            - keywords: ${keywords.map((key) => {key})}
            - complexity: ${complexity}
            - questionCount: ${questionCount}
            `
      }
  ],
});
 
console.log(completion.choices[0].message);


 
  };
//get the key words from the passage according to frequency 
  function extractKeywordsFromText(text) { 
    const words = text.split(/\W+/);
    const wordFreq = {};
    words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    setKeywords( Object.keys(wordFreq)
        .filter((word) => word.length > 3)  
        .sort((a, b) => wordFreq[b] - wordFreq[a])  
        .slice(0, 10));
}

  useEffect(() => {
      const getLoadedPdf  = () => {
        const content = localStorage.getItem('extractedText');
  
        if(content) {
          console.log(content);
          setpdfContent(content);
          extractKeywordsFromText(content)
        }else{
          console.log('none')
        }
      }
  
      getLoadedPdf();
    }, []) 

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
        {/* <div className="input-wrapper">
          <label htmlFor="keywords">Keywords (optional):</label>
          <input
            id="keywords"
            type="text"
            placeholder="Enter keywords, comma-separated"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div> */}
   
        <div className="question-type-selector  ">
          <button 
            className={questionType === 'multiple' ? 'active' : ''}
            onClick={() => {
              setQuestionType('multiple') 
            }}
          >
            Multiple Choice
          </button>
          <button 
            className={questionType === 'structured' ? 'active' : ''}
            onClick={() => {
              setQuestionType('structured') 
            }}
          >
            Structured Question
          </button>
        </div>
        
          {/* structured questions might be difficul to get accurate answers or correctness off the answer so they will require a different prompt */}
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
