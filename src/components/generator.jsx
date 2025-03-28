import { useState, useEffect } from "react";
import { Trash } from "lucide-react";
import "./generator.css";
import { useNavigate } from "react-router-dom";
import OpenAI from "openai";
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';
import { supabase } from '@/lib/supabaseClient';
import {fetchUser} from '@/lib/authUser';
import { encode } from "gpt-tokenizer";

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
  const [user, setUser] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [userPdfs, setUserPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [tokenCounts, setTokenCounts] = useState({
    input: 0,
    output: 0,
    cache: 0,
    total: 0
  });
  
  const questionCounts = ["5", "10", "15", "20", "25"];
  const complexityLevels = ["Structured", "Multichoice"];
  
  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  
  const navigate = useNavigate();

  const calculateTokens = (text) => {
    try {
      return encode(text).length;
    } catch (error) {
      console.error('Error calculating tokens:', error);
      return 0;
    }
  };

  const extractTextFromPDF = async (file) => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result);

      try {
        const pdfDocument = await getDocument(typedArray).promise;
        let extractedText = '';
        const totalPages = pdfDocument.numPages;

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
          const page = await pdfDocument.getPage(pageNumber);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
          
          setExtractionProgress((pageNumber / totalPages) * 100);
        }

        localStorage.setItem('extractedText', extractedText);
        localStorage.setItem('fileName', file.name);
        setPdfContent(extractedText);
        
        // Calculate input tokens
        const inputTokens = calculateTokens(extractedText);
        setTokenCounts(prev => ({
          ...prev,
          input: inputTokens,
          total: inputTokens + prev.output + prev.cache
        }));
        
        console.log(extractedText);
        extractKeywordsFromText(extractedText);
        
      } catch (error) {
        console.error('Error extracting text: ', error);
        alert('Error extracting text from PDF.');
      } finally {
        setIsExtracting(false);
        setExtractionProgress(0);
      }
    };

    fileReader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading the PDF file.');
      setIsExtracting(false);
      setExtractionProgress(0);
    };

    fileReader.readAsArrayBuffer(file);
  };

  const extractTextFromPDFURL = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const pdfBlob = await response.blob();
      const typedArray = new Uint8Array(await pdfBlob.arrayBuffer());
  
      const pdfDocument = await getDocument(typedArray).promise;
      let extractedText = '';
      const totalPages = pdfDocument.numPages;
  
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
      }
  
      localStorage.setItem('extractedText', extractedText);
      
      // Calculate cache tokens
      const cacheTokens = calculateTokens(extractedText);
      setTokenCounts(prev => ({
        ...prev,
        cache: cacheTokens,
        total: prev.input + prev.output + cacheTokens
      }));
      
      console.log('Text extracted successfully:', extractedText);
      return extractedText;
  
    } catch (error) {
      console.error('Error extracting text: ', error);
      throw error;
    }
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

      extractTextFromPDF(file);
      uploadFile(file);
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
      console.log(completion)
      const parsedResponse = extractJSONObject(completion.choices[0].message.content);
      
      if (!parsedResponse || !parsedResponse.questions) {
        throw new Error('Invalid response format from AI');
      }

      // Calculate output tokens
      const outputTokens = calculateTokens(JSON.stringify(parsedResponse));
      setTokenCounts(prev => ({
        ...prev,
        output: outputTokens,
        total: prev.input + outputTokens + prev.cache
      }));

      // Validate question types
      const isValidFormat = parsedResponse.questions.every(q => 
        q.type === (complexity === 'Multichoice' ? 'multiple' : 'structured') &&
        (q.type === 'multiple' ? Array.isArray(q.options) && q.options.length === 4 : true)
      );

      if (!isValidFormat) {
        throw new Error('Generated questions do not match the requested format');
      }
        console.log(tokenCounts)
      navigate("/Question", { 
        state: { 
          questions: parsedResponse.questions,
          documentId: documentId,
          tokenCounts: tokenCounts
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

    const getUserDetails = async () => {
      const user = await fetchUser();
     
      if (user) {
        console.log(user)
        fetchUserPdfs(user);
        setUser(user); 
      }
    };
    

    getUserDetails() 
  }, [ ]);

    const uploadFile = async (file) => {
      if (!user) return;
      
      setUploadProgress(0);
      setUploadError(null);
      
      try {
        const timestamp = Date.now();
        const filePath = `${user.id}/tests/${timestamp}_${file.name}`;
        let uploadError;
        
        if (file.size > 6 * 1024 * 1024) {
          uploadError = await uploadInChunks(file, filePath);
        } else {
          const { error } = await supabase.storage.from('pdfs').upload(filePath, file);
          uploadError = error;
          setUploadProgress(100);
        }
  
        if (uploadError) {
          setUploadError(uploadError.message);
          console.error('Upload error:', uploadError);
          return;
        }
  
        // Create document record in the documents table
        const { data: documentData, error: dbError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: file.name,
            file_type: file.type.split('/')[1],
            file_path: filePath,
            file_size: file.size,
            file_condition: "test",
            metadata: {
              originalName: file.name,
              contentType: file.type,
              uploadedAt: new Date().toISOString()
            }
          })
          .select()
          .single();
  
        if (dbError) {
          setUploadError(dbError.message);
          console.error('Database error:', dbError);
          return;
        }
  
        // Set the document ID
        setDocumentId(documentData.id);
  
      } catch (error) {
        setUploadError(error.message);
        console.error('Error in upload process:', error);
      }
    };



 const uploadInChunks = async (file, filePath) => {
  const chunkSize = 6 * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadedChunks = 0;
  const chunks = [];
  
  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkPath = `${filePath}.part${i}`;
      
      const { error } = await supabase.storage.from('pdfs')
        .upload(chunkPath, chunk, { upsert: true });
      
      if (error) throw error;
      
      chunks.push(chunkPath);
      uploadedChunks++;
      setUploadProgress((uploadedChunks / totalChunks) * 100);
    }

    // Combine chunks
    const { error } = await supabase.storage.from('pdfs')
      .copy(chunks[0], filePath);

    // Clean up chunks
    await Promise.all(chunks.map(chunkPath =>
      supabase.storage.from('pdfs').remove([chunkPath])
    ));

    return error;
  } catch (error) {
    // Clean up on error
    await Promise.all(chunks.map(chunkPath =>
      supabase.storage.from('pdfs').remove([chunkPath])
    ));
    return error;
  }
};

const fetchUserPdfs = async (user) => {
  if (!user) return;
  
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_type', 'pdf');
    
    if (error) throw error;
    setUserPdfs(data || []);
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    setError('Failed to load your PDFs');
  }
};

const handlePdfSelect = async (e) => {
  const pdfId = e.target.value;
  
  if (!pdfId) return;
  
  try {
    setIsExtracting(true);
    setError(null);

    const { data } = supabase.storage.from('pdfs').getPublicUrl(pdfId);
    console.log('PDF Public URL:', data.publicUrl);

    const extractedText = await extractTextFromPDFURL(data.publicUrl);
    
    setPdfContent(extractedText);
    extractKeywordsFromText(extractedText);
    setSelectedPdf(pdfId);
  } catch (error) {
    console.error('Error selecting PDF:', error);
    setError('Failed to extract text from PDF');
  } finally {
    setIsExtracting(false);
  }
};
    

  return (
    <div className="generator-container">
      <div className="dropdown-group">
        {error && <div className="error-message">{error}</div>}
        
        {/* Token Count Display */}
        {/* <div className="token-info">
          <p>Input Tokens: {tokenCounts.input}</p>
          <p>Output Tokens: {tokenCounts.output}</p>
          <p>Cache Tokens: {tokenCounts.cache}</p>
          <p>Total Tokens: {tokenCounts.total}</p>
        </div> */}
        
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

        {/* PDF Selector Dropdown */}
        <div className="input-wrapper">
          <label htmlFor="pdfSelect">Select Existing PDF:</label>
          <select
            id="pdfSelect"
            value={selectedPdf}
            onChange={handlePdfSelect}
            disabled={isLoading || isExtracting}
          >
            <option value="">
              {isExtracting ? 'Extracting PDF...' : '-- Select a PDF --'}
            </option>
            {userPdfs.map((pdf) => (
              <option key={pdf.id} value={pdf.file_path}>
                {pdf.name}
              </option>
            ))}
          </select>
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
              disabled={isLoading || isExtracting}
            />
            {uploadError && (
              <div className="error-message">{uploadError}</div>
            )}
            {(uploadProgress > 0 || isExtracting) && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ 
                      width: `${isExtracting ? extractionProgress : uploadProgress}%` 
                    }} 
                  />
                </div>
                <div className="progress-text">
                  {isExtracting 
                    ? `Extracting PDF... ${Math.round(extractionProgress)}%`
                    : uploadProgress > 0 
                      ? `Uploading... ${Math.round(uploadProgress)}%`
                      : ''}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="input-wrapper">
            {/* <label htmlFor="customText">Content from PDF:</label>
            <textarea
              id="customText"
              value={pdfContent}
              readOnly
              placeholder="PDF content will appear here"
            ></textarea> */}
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
