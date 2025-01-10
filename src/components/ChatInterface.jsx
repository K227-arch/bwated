import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Mic, Link, BookOpen} from 'lucide-react';
import './ChatInterface.css';
import axios from 'axios';
import { ReactMediaRecorder, useReactMediaRecorder  } from "react-media-recorder";
import OpenAI from "openai"; 

export default function ChatInterface() {
   const [pdfContent, setpdfContent ] = useState('')
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);   
  const [audio, setAudio] = useState(null); 
  const [audioLoaded, setaudioLoaded] = useState(false)

  // const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  //whisper settings

  const { status, startRecording, stopRecording, mediaBlobUrl } =
  useReactMediaRecorder({ audio: true });


  
  const handleUploadAndTranscribe = async () => {
    try{ 
        const response = await fetch(mediaBlobUrl);
        const audioBlob = await response.blob();
    //   const formData = new FormData();
    //   formData.append("file", audioBlob, "audio.wav");
    //   formData.append("model", "whisper-1");

    console.log(audioBlob);
    const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });


    const  transcription = await openai.audio.transcriptions.create({
      file:  audioFile,
      model: "whisper-1",
      language: "en"
    });
    
    console.log(transcription.text);
    setQuestion(transcription.text);
    }catch (e){
      console.log(e.message)
    }
     
  };

  const navigate  = useNavigate()
  function test(){
    navigate("/test")
  }
  const gotoUpload=()=>{
    navigate("/upload")
  }

  const handleSend = () => { 
    if (question.trim() !='') {
      // Handle sending message
      handleQuestionSubmit()
      
    }else{
      alert('No question asked')
    }
  };

  //send the doccument first to api
  const sendPDFContentToOpenAI = async (pdfContent) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
                You are a knowledgeable and supportive assistant for students. 
                Your job is to answer their questions based solely on the provided PDF content.
                If a question cannot be answered from the PDF, politely inform the user 
                and encourage them to ask something relevant to the material.
              `,
            },
            {
              role: "user",
              content: `
                Here is the content of a PDF: "${pdfContent}". 
                Please remember that the answers should only reference this content. 
                The student's question is: "${question}".
              `,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          },
        }
      );
  
      const initialContext = response.data.choices[0].message.content;
      setChatHistory([
        {
          role: "system",
          content: `
            You are a knowledgeable and supportive assistant for students. 
            Your job is to answer their questions based solely on the provided PDF content.
            If a question cannot be answered from the PDF, politely inform the user 
            and encourage them to ask something relevant to the material.
          `,
        },
        {
          role: "user",
          content: `
            Here is the content of a PDF: "${pdfContent}". 
            Please remember that the answers should only reference this content. 
            The student's question is: "${question}".
          `,
        },
        { role: "assistant", content: initialContext },
      ]);
    } catch (error) {
      console.error("Error sending PDF content:", error.message);
      alert("An error occurred while sending PDF content.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuestionSubmit = async () => {
    if (!chatHistory.length) {
      sendPDFContentToOpenAI(pdfContent);
      return;
    }
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }
    setLoading(true);
  
    try {
      const updatedChatHistory = [
        ...chatHistory,
        { role: "user", content: question },
      ];
  
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            ...updatedChatHistory,
            {
              role: "system",
              content: `
                Always refer to the PDF content when answering questions.
                If the answer cannot be derived from the PDF, politely respond that the information is not available in the document.
              `,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          },
        }
      );
  
      const answer = response.data.choices[0].message.content;
      setResponse(answer);
      // readAIResponseAloud(answer);
      setChatHistory([...updatedChatHistory, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error("Error answering question:", error.message);
      alert("An error occurred while answering the question.");
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };
  
  const readAIResponseAloud = async (responseText) => {
    try {
      // Generate TTS audio using OpenAI API
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: responseText,
      });
  
      // Convert ArrayBuffer to Blob
      const buffer = await mp3.arrayBuffer();
      const audioBlob = new Blob([buffer], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
  
      // Create a new audio object and play
      const newAudio = new Audio(audioUrl);
      newAudio.play();
  
      // Update state with the new audio object
      setAudio(newAudio);
      setaudioLoaded(true);
    } catch (error) {
      console.error("Error generating speech:", error); // Log full error
      alert("An error occurred while generating speech.");
    }
  };
  
  // Toggle pause and resume functionality
  const togglePauseResume = () => {
    if (audio) {
      if (isPaused) {
        audio.play();
      } else {
        audio.pause();
      }
      setIsPaused(!isPaused);
    }
  };
  

  useEffect(() => {
    const getLoadedPdf  = () => {
      const content = localStorage.getItem('extractedText');

      if(content) {
        console.log(content);
        setpdfContent(content);
          
      }else{
        console.log('none')
      }
    }

    getLoadedPdf();
   
  }, []) 

  return (
    <div className="chat-container">
      <div className="chat-messages">


      {chatHistory && chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === 'user' ? 'You' : 'AI'}</div>
            <div className="message-content">
              <p>{msg.content}</p>
                  {msg.role === 'assistant' && (
                    
                   <div className="audio-controls">
                       <button onClick={() => readAIResponseAloud(msg.content)}>🔊</button>
                        <button onClick={togglePauseResume} disabled={!audio}>
                          {isPaused ? "Resume" : "Pause"}
                        </button>
                 </div>
                )}
            </div>
          </div>
        ))}


        <div className="message">
          <div className="avatar">AI</div>
          <div className="message-content">
            <p>{response ? '...' : response}</p>
          </div>
        </div>
         
      </div>
      {mediaBlobUrl && (
              <div>
                <audio src={mediaBlobUrl} controls />
              </div>
            )}
      <div className="action-bar">
        <div className="action-buttons"> 
          <div>
            {status === 'recording' ? 
            <button className="action-btn"
                onClick= {
                  stopRecording 
                }
              >
                <Mic size={16} />
                Stop Recording
              </button>
              : 
              <button className="action-btn" onClick={startRecording}>
                <Mic size={16} />
                Voice Chat
              </button>
              } 
              
          </div>
          <button
              className='action-btn'
                onClick= {
                  handleUploadAndTranscribe
                }
              >
                <Send size={16} />
                send audio
              </button>
          <button className="action-btn" onClick={test}>
            <BookOpen size={16} />
            Take Test
          </button>
          <button className="action-btn" onClick={gotoUpload}>
            <Link size={16} />
            Attach files
          </button>
          
        </div>

         {/* <div className="audio-controls">
                       <button onClick={() => readAIResponseAloud("this is a very serious boy")}>🔊</button>
                        <button onClick={togglePauseResume} disabled={!audio}>
                          {isPaused ? "Resume" : "Pause"}
                        </button>
                 </div> */}
        
        <div className="input-container">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="chat-input"
          />
          <button className="send-btn" onClick={handleSend}>
            {loading ? 
            'sending...'
            :
            <ArrowRight size={20} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

