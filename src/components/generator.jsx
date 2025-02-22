import { useState, useEffect } from "react";
import "./generator.css";
import { useNavigate } from "react-router-dom";
import OpenAI from "openai";
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';
import { supabase } from '@/lib/supabaseClient';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

function Generator() {
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [complexity, setComplexity] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [pdfContent, setPdfContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const questionCounts = ["5", "10", "15", "20", "25"];
  const complexityLevels = ["Structured", "Multichoice"];
  
  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  
  const navigate = useNavigate();


  const extractTextFromPDF = async (file) => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsExtracting(true);
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result);

      try {
        const pdfDocument = await getDocument(typedArray).promise;
        let extractedText = '';

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
          const page = await pdfDocument.getPage(pageNumber);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
        } 
        localStorage.setItem('extractedText', extractedText);
        localStorage.setItem('fileName', file.name);
        setPdfContent(extractedText);
        extractKeywordsFromText(extractedText);
        // navigate('/Documentchat');
        
      } catch (error) {
        console.error('Error extracting text: ', error);
        alert('Error extracting text from PDF.');
      } finally {
        setIsExtracting(false);
      }
    };

    fileReader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading the PDF file.');
      setIsExtracting(false);
    };

    fileReader.readAsArrayBuffer(file);
  };
  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check file type
      if ( 
          !file.type.includes('application/pdf')) {
        throw new Error('Please upload a text or Word document');
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size should be less than 5MB');
      }

      const text = await file.text();
      setText(text);
      extractTextFromPDF(file);
      // extractKeywordsFromText(text);
    } catch (error) {
      console.error('Error reading file:', error);
      setError(error.message || 'Failed to read the uploaded file');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract keywords from text
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

function extractJSONObject(input) {
  if (typeof input !== "string") {
    console.error("Error: input is not a string", input);
    return null;
  }

  // Remove code block markers (```javascript ... ```)
  const cleanedInput = input.replace(/```(?:json|javascript)?\n?([\s\S]*?)\n?```/g, "$1").trim();

  try {
    return JSON.parse(cleanedInput);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}


  const handleGenerate = async () => {
    if (!questionCount || !complexity) {
      setError('Please select question count and type');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an AI assistant that creates tests based on uploaded documents." 
          },
          {
            role: "user",
            content: `
              Create a test based on the following document content:
              ---
              ${pdfContent}
              ---

              Create ${questionCount} questions of type "${complexity === 'Multichoice' ? 'multiple' : 'structured'}".
              
              Rules:
              ${complexity === 'Multichoice' ? `
              - All questions must be multiple choice with exactly 4 options
              - One option must be correct
              - Options should be plausible but clearly distinguishable
              ` : `
              - All questions must be structured (open-ended)
              - Answers should be clear and concise
              - Include key points that should be present in a good answer
              `}

              Return the test in this exact JSON format:
              {
                "questions": [
                  ${complexity === 'Multichoice' ? `{
                    "question": "Sample question?",
                    "type": "multiple",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Option A"
                  }` : `{
                    "question": "Sample question?",
                    "type": "structured",
                    "answer": "Expected answer with key points"
                  }`}
                ]
              }

              Focus on these key topics: ${keywords.join(', ')}
            `
          }
        ],
      });

      const parsedResponse = extractJSONObject(completion.choices[0].message.content);
      
      if (!parsedResponse || !parsedResponse.questions) {
        throw new Error('Invalid response format from AI');
      }

      // Validate question types
      const isValidFormat = parsedResponse.questions.every(q => 
        q.type === (complexity === 'Multichoice' ? 'multiple' : 'structured') &&
        (q.type === 'multiple' ? Array.isArray(q.options) && q.options.length === 4 : true)
      );

      if (!isValidFormat) {
        throw new Error('Generated questions do not match the requested format');
      }

      navigate("/Question", { 
        state: { 
          questions: parsedResponse.questions 
        }
      });

    } catch (error) {
      console.error('Error generating test:', error);
      setError(error.message || 'Failed to generate test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load PDF content on mount
  useEffect(() => {
    const content = localStorage.getItem('extractedText');
    if (content) {
      setPdfContent(content);
      extractKeywordsFromText(content);
    }
  }, [ ]);

  return (
    <div className="generator-container">
      <div className="dropdown-group">
        {error && <div className="error-message">{error}</div>}
        
        {/* Question Count Dropdown */}
        <div className="dropdown-wrapper">
          <label htmlFor="questionCount">How many Questions:</label>
          <select
            id="questionCount"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            disabled={isLoading}
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
            disabled={isLoading}
          >
            <option value="">-- Please select an option --</option>
            {complexityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Keywords Display */}
        <div className="input-wrapper">
          <label>Generated Keywords:</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => keywords.map((key) => {key})}
            placeholder="Keywords will be generated automatically"
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

        {/* File Upload or Text Input */}
        {isFileUpload ? (
          <div className="input-wrapper">
            <label htmlFor="fileUpload">Upload File:</label>
            <input 
              type="file"
              id="fileUpload"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="input-wrapper">
            <label htmlFor="customText">Content from PDF:</label>
            <textarea
              id="customText"
              value={pdfContent}
              readOnly
              placeholder="PDF content will appear here"
            ></textarea>
          </div>
        )}

        {/* Generate Button */}
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={isLoading || !questionCount || !complexity}
        >
          {isLoading ? 'Generating...' : 'Start Test'}
        </button>
      </div>
    </div>
  );
}

export default Generator;
