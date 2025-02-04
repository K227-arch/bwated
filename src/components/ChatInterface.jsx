import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Mic, Link, BookOpen} from 'lucide-react';
import Recording from '../components/Recording';
import './ChatInterface.css';
import OpenAI from "openai"; 




export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [pdfContent, setpdfContent ] = useState('')
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
 
  const navigate  = useNavigate()

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

 
  const handleGenerate = async () => {
    try {
      

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        //  max_tokens: 50,
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
      });

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
    }
  };  

  function test(){
    navigate("/test")
  }
  const gotoUpload=()=>{
    navigate("/upload")
  }

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  const TTSData = (data) => {
    setQuestion(data)
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
      {chatHistory && chatHistory.map((msg, index) => (
        <div className={`message ${msg.role}`} key={index}>
            <div className="avatar">{msg.role === 'user' ? 'You' : 'AI'}</div>
            <div className="message-content">
            <p>{msg.content}</p>   
            {audioSrc && (
                <>
                  <h2>Generated Audio:</h2>
                  <audio controls src={audioSrc}></audio>
                </>
              )}       
          </div>
        </div>
        
        
        // <div className="message user">
        //   <div className="message-content">
        //     <p>Can you summarize the main points of the document?</p>
            
        //   </div>
          
        // </div>

      ))}


      <div className="message">
          <div className="avatar">AI</div>
          <div className="message-content">
            <p>{responseText ? '...' : responseText}</p>
          </div>
        </div>
         
       </div> 
      
      <div className="action-bar">
        
        
        <div className="input-container">
          
          <Recording TranscribedText={TTSData} />
          <button className="send-btn" onClick={handleGenerate}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

