import React, { useState, useRef, useEffect } from "react";
import OpenAI from "openai";
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { encode, decode } from "gpt-tokenizer";
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { supabase } from '@/lib/supabaseClient';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeAudiosRef = useRef(new Set());
  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const fileInputRef = useRef(null);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [showMessages, setShowMessages] = useState(false);
  const [name , setName] = useState('')
  // Voice options
  const voices = [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const getContent = async () => {
      const extractedText = localStorage.getItem('extractedText') || ''; // Ensure we get the extracted text
      if (!extractedText) {
        console.warn('No extracted text found in local storage.');
        return; // Exit if no text is found
      }

      try {
        const totalTokens = encode(extractedText).length; // Calculate tokens using the tokenizer
      console.log('Total tokens in PDF:', totalTokens);

      // Start loading state
      setIsLoading(true);
      await sendChunkToModel(extractedText);

      // // If tokens exceed 122,000, break into chunks
      // if (totalTokens > 122000) {
      //   const chunks = breakIntoChunks(extractedText, 122000);
      //   for (const chunk of chunks) {
      //     await sendChunkToModel(chunk);
      //   }
      // } else {
      //   // Send the entire text if within limits
      //   await sendChunkToModel(extractedText);
      //   console.log('No limits, sending entire text');
      // }
      }catch (e) {
        console.log(e)
      }

      // Stop loading state after processing
      setIsLoading(false);
    };

    const fetchLoggedInUser = async () => {
      try {
        const { data: user, error } = await supabase.auth.getUser(); // Use Supabase to retrieve the logged-in user
        if (error) {
          console.error('Error fetching user from Supabase:', error);
        }
        if (user) {
          // console.log('Logged in user:', user);
          setName(user.user.user_metadata.full_name || ''); // Set the name state if available
        } else {
          console.warn('No user is logged in.');
        }
      } catch (error) {
        console.error('Error fetching logged in user:', error);
      }
    };
 



    
      fetchLoggedInUser(); // Call the function to fetch the logged-in user
  

    // Call the function to get content
    getContent();
  }, []); // Ensure this array is empty to run only once

  useEffect(() => {
    scrollToBottom();  
  }, [messages]);

  const stopAllAudios = () => {
    activeAudiosRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudiosRef.current.clear();
  };

  const startListening = () => {
    stopAllAudios();

    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setMessages(prev => [...prev, {
        role: 'user',
        content: '🎤 Listening...',
        temporary: true
      }]);
    };

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => prev.filter(msg => !msg.temporary));
      await handleGenerate(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setMessages(prev => prev.filter(msg => !msg.temporary));
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (messages.some(msg => msg.temporary)) {
        setMessages(prev => prev.filter(msg => !msg.temporary));
      }
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setMessages(prev => prev.filter(msg => !msg.temporary));
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };
  // const extractTextFromPDF = async (file) => {
  //   if (!file) {
  //     alert('Please select a PDF file first');
  //     return;
  //   }

  //   const fileReader = new FileReader();

  //   fileReader.onload = async () => {
  //     const typedArray = new Uint8Array(fileReader.result);

  //     try {
  //       const loadingTask = pdfjsLib.getDocument(typedArray);
  //       const pdfDocument = await loadingTask.promise;
  //       let extractedText = '';
  //       const totalPages = pdfDocument.numPages;

  //       for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
  //         const page = await pdfDocument.getPage(pageNumber);
  //         const textContent = await page.getTextContent();
          
  //         // Join the text items without extra spaces
  //         const pageText = textContent.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
  //         extractedText += pageText + '\n';
  //       }

  //       console.log('Extracted PDF text:', extractedText);
  //       setPdfText(extractedText);
  //       setPdfName(file.name);

  //       // Calculate tokens
  //       const totalTokens = encode(extractedText).length; // Calculate tokens using the tokenizer
  //       console.log('Total tokens in PDF:', totalTokens);

  //       // Start loading state
  //       setIsLoading(true);

  //       // If tokens exceed 122,000, break into chunks
  //       if (totalTokens > 122000) {
  //         const chunks = breakIntoChunks(extractedText, 122000);
  //         for (const chunk of chunks) {
  //           await sendChunkToModel(chunk, file.name);
  //         }
  //       } else {
  //         // Send the entire text if within limits
  //         await sendChunkToModel(extractedText, file.name);
  //       }
        
  //     } catch (error) {
  //       console.error('Error extracting text: ', error);
  //       alert('Error extracting text from PDF.');
  //     } finally {
  //       // Stop loading state after processing
  //       setIsLoading(false);
  //     }
  //   };

  //   fileReader.onerror = () => {
  //     console.error('Error reading file');
  //     alert('Error reading the PDF file.');
  //   };

  //   fileReader.readAsArrayBuffer(file);
  // };

  const sendChunkToModel = async (chunk) => {
    const initialPrompt = name ? `I've uploaded a PDF document, ${name}. Here's a chunk of the content:\n\n${chunk}\n\nPlease acknowledge that you've received this content and are ready to discuss it.` : `I've uploaded a PDF document. Here's a chunk of the content:\n\n${chunk}\n\nPlease acknowledge that you've received this content and are ready to discuss it.`;
    await handleGenerate(initialPrompt, true);
  };

  const breakIntoChunks = (text, maxTokens) => {
    const words = text.split(/\s+/); // Split text into words
    const chunks = [];
    let currentChunk = [];
    let currentTokenCount = 0;

    for (const word of words) {
      const wordTokenCount = encode(word).length; // Calculate tokens for the word
      if (currentTokenCount + wordTokenCount > maxTokens) {
        chunks.push(currentChunk.join(' ')); // Push the current chunk to chunks
        currentChunk = [word]; // Start a new chunk with the current word
        currentTokenCount = wordTokenCount; // Reset token count for the new chunk
      } else {
        currentChunk.push(word); // Add word to the current chunk
        currentTokenCount += wordTokenCount; // Update token count
      }
    }

    // Push any remaining words as the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  };

  // const handleFileUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (file && file.type === 'application/pdf') {
  //     await extractTextFromPDF(file);
  //   } else {
  //     alert('Please upload a valid PDF file');
  //   }
  // };

  const handleGenerate = async (transcript, isPdfContext = false) => {
    if (!transcript.trim()) return;
    setIsLoading(true);
    setIsTyping(true);

    const newUserMessage = { role: 'user', content: transcript };
    setMessages(prev => [...prev, newUserMessage]);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Thinking...',
      isTyping: true,
      temporary: true
    }]);
    
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_KEY,
      dangerouslyAllowBrowser: true
    });

    try {
      // Include PDF context in system message if available
      const systemMessage = pdfText && !isPdfContext
        ? `You are a knowledgeable teacher leading a discussion about the PDF  with your student ${name}. Your voice has natural intonation, clear pronunciation, and varied pacing to maintain engagement. Begin with a hook that introduces the PDF's content, then present a structured overview that outlines key topics and learning objectives. Use a conversational yet authoritative tone, addressing ${name} by name while guiding the discussion. Break down complex concepts into digestible segments, provide relevant examples and analogies, and strategically pause for reflection. Reference this context in your responses: ${pdfText.substring(0, 1000)}...`
        : `As an engaging instructor, you will lead discussions with a podcast-like teaching style characterized by natural intonation, clear pronunciation, and dynamic pacing. Your delivery combines authority with warmth - using rhetorical questions, storytelling, and real-world examples to maintain ${name}'s interest. Start each response with a brief context-setting introduction before diving into explanations. Break down complex topics into clear segments, provide illuminating analogies, and smoothly transition between concepts. Regularly check ${name}'s understanding through targeted questions while maintaining an encouraging tone. Your speech should convey enthusiasm for the subject matter while ensuring key points are emphasized through strategic pauses and varied vocal expression. Remember to address ${name} by name and adapt your explanations based on their demonstrated comprehension level.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini-audio-preview",
        modalities: ["text", "audio"],
        audio: { 
          voice: selectedVoice,
          format: "wav" 
        },
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          ...messages,
          newUserMessage,
        ],
      });

      // Process the response
      setMessages(prev => prev.filter(msg => !msg.temporary));

      const textResponse = response.choices[0].message.audio.transcript;
      const audioData = response.choices[0].message.audio.data;
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))], {
        type: "audio/wav",
      });
      const audioURL = URL.createObjectURL(audioBlob);

      const audioElement = new Audio(audioURL);
      
      audioElement.addEventListener('play', () => {
        activeAudiosRef.current.add(audioElement);
      });

      audioElement.addEventListener('ended', () => {
        activeAudiosRef.current.delete(audioElement);
      });
      audioElement.addEventListener('pause', () => {
        activeAudiosRef.current.delete(audioElement);
      });

      audioElement.play();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: textResponse,
        audioUrl: audioURL
      }]);
    } catch (error) {
      console.error("Error generating text and audio:", error);
      alert('There was an error communicating with the AI model. Please try again later.');
      setMessages(prev => prev.filter(msg => !msg.temporary));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Bwated</h1>
      
      {/* Voice Selection Dropdown */}
      <div style={{ 
        marginBottom: "20px",
        padding: "15px",
        background: "transparent",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <label htmlFor="voice-select" style={{ fontWeight: "500" }}>AI Voice:</label>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            backgroundColor: "#2dd4bf",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          {voices.map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>

        {/* Toggle Button */}
        <button
          onClick={() => setShowMessages(!showMessages)}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            background: "#2dd4bf",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span role="img" aria-label="toggle">
            {showMessages ? "🤖" : "💬"}
          </span>
          {showMessages ? "Show AI" : "Show Messages"}
        </button>
      </div>

      {/* PDF Upload Section */}
      {/* <div style={{ 
        marginBottom: "20px",
        padding: "15px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            background: "#28a745",
            color: "white",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          Upload PDF
        </button>
        {pdfName && (
          <div style={{ 
            marginTop: "10px",
            fontSize: "14px",
            color: "#666"
          }}>
            Current PDF: {pdfName}
          </div>
        )}
      </div> */}

      {/* Loader */}
      {/* {isLoading && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <p>Loading... Please wait while the content is being processed.</p>
          <div className="loader"></div>
        </div>
      )} */}

      {/* Conditional Render: AI Animation or Messages */}
      {showMessages ? (
        // Messages View
        <div style={{ 
          height: "400px", 
          overflowY: "auto", 
          border: "1px solid #ccc", 
          padding: "20px",
          marginBottom: "20px",
          borderRadius: "8px"
        }}>
          {messages.map((message, index) => (
            <div 
              key={index}
              style={{
                marginBottom: "15px",
                textAlign: message.role === 'user' ? 'right' : 'left',
                opacity: message.temporary ? 0.7 : 1
              }}
            >
              <div style={{
                background: message.role === 'user' ? '#007bff' : '#f0f0f0',
                color: message.role === 'user' ? 'white' : 'black',
                padding: "10px 15px",
                borderRadius: "15px",
                display: "inline-block",
                maxWidth: "70%"
              }}>
                {message.isTyping ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: "0" }}>{message.content}</p>
                    {message.audioUrl && (
                      <audio 
                        controls 
                        src={message.audioUrl} 
                        style={{ 
                          marginTop: "10px",
                          display: "none"
                        }}
                      ></audio>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        // AI Animation View
        <div style={{ 
          height: "400px", 
          
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
          background: "transparent"
        }}>
          <div className="ai-animation">
            <div className="pulse"></div>
            <div className="particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="particle"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recording Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button 
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading}
          style={{
            padding: "15px 30px",
            borderRadius: "50px",
            border: "none",
            background: isListening ? "#2dd4bf" : "#2dd4bf",
            color: "white",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: isListening ? "pulse 1.5s infinite" : "none"
          }}
        >
          <span role="img" aria-label="microphone">
            {isListening ? "🔴" : "🎤"}
          </span>
          {isLoading ? "Processing..." : isListening ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 4px;
          }

          .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #666;
            border-radius: 50%;
            animation: bounce 1s infinite;
          }

          .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
          .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }

          .ai-animation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          .pulse {
            width: 100px;
            height: 100px;
            background: #2dd4bf;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
            box-shadow: 0 0 30px #2dd4bf;
            
          }

          .particles {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
          }

          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #2dd4bf;
            border-radius: 50%;
            animation: particle 3s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }

          @keyframes particle {
            0% {
              transform: rotate(0deg) translateY(0) scale(1);
              opacity: 1;
            }
            100% {
              transform: rotate(360deg) translateY(80px) scale(0);
              opacity: 0;
            }
          }

          .particles .particle:nth-child(1) { animation-delay: 0.1s; }
          .particles .particle:nth-child(2) { animation-delay: 0.2s; }
          .particles .particle:nth-child(3) { animation-delay: 0.3s; }
          .particles .particle:nth-child(4) { animation-delay: 0.4s; }
          .particles .particle:nth-child(5) { animation-delay: 0.5s; }
          .particles .particle:nth-child(6) { animation-delay: 0.6s; }
          .particles .particle:nth-child(7) { animation-delay: 0.7s; }
          .particles .particle:nth-child(8) { animation-delay: 0.8s; }
          .particles .particle:nth-child(9) { animation-delay: 0.9s; }
          .particles .particle:nth-child(10) { animation-delay: 1s; }
          
          .particles .particle {
            transform-origin: 50% 50%;
          }

          .particles .particle:nth-child(2n) {
            animation-duration: 4s;
          }

          .particles .particle:nth-child(3n) {
            animation-duration: 5s;
          }

          .particles .particle:nth-child(4n) {
            animation-duration: 6s;
          }

          /* Loader styles */
          .loader {
            border: 8px solid #f3f3f3; /* Light grey */
            border-top: 8px solid #2dd4bf; /* Blue */
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 2s linear infinite;
            margin: 0 auto;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default App;
