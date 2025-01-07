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
            {"role": "developer",
                "content": [
                  {
                    "type": "text",
                    "text": `
                      You are a helpful assistant that answers  
                      questions about provided book content to students
                    `
                  }
                ]},
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Here is the content of a PDF: "${pdfContent}". ${question}` },
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
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Here is the content of a PDF: "${pdfContent}". ${question}` },
        { role: "assistant", content: initialContext },
      ]);
 

    } catch (error) {
      console.error('Error sending PDF content:', error.message);
      alert('An error occurred while sending PDF content.');
    } finally {
      setLoading(false);
    }
  };


  // handle user interaction questions to api
  const handleQuestionSubmit = async () => { 
    if (!chatHistory.length) {
      sendPDFContentToOpenAI(pdfContent);
      return;
    }
    if (!question.trim()) {
      alert('Please enter a question.');
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
          messages: updatedChatHistory,
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
      setChatHistory([...updatedChatHistory, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error('Error answering question:', error.message);
      alert('An error occurred while answering the question.');
    } finally {
      setLoading(false);
      setQuestion('');
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
            </div>
          </div>
        ))}


        <div className="message">
          <div className="avatar">AI</div>
          <div className="message-content">
            <p>{response ? '...' : response}</p>
          </div>
        </div>
        
        {/* <div className="message user">
          <div className="message-content">
            <p>Can you summarize the main points of the document?</p>
            
          </div>
          
        </div> */}
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

