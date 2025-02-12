import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Recording from "../components/Recording";
import "./ChatInterface.css";
import OpenAI from "openai"; 
import axios from "axios";


export default function ChatInterface({ isNavVisible }) {
  const [pdfContent, setpdfContent ] = useState('')
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });


  const [canActivateSideBarContentPush, activateSideBarPush] = useState(true);

  const sideBarMediaQuery = window.matchMedia("(max-width:704px)");

  sideBarMediaQuery.onchange = (ev) => {
    if (ev.matches) {
      activateSideBarPush(false);
    } else {
      activateSideBarPush(true);
    }
  };
  

  const willBeAbleToPushContentWithSideBar = canActivateSideBarContentPush && isNavVisible;

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  function test() {
    navigate("/test");
  }
  const gotoUpload = () => {
    navigate("/upload");
  };


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


  const HandleQn = (question) => {
    setQuestion(question)
  }
  
  const handleSend = () => {
    if (question.trim() != "") {
      // Handle sending message
      handleQuestionSubmit();
      setQuestion("");
    }else {
      alert('No question asked')
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
      <div
        className="boundary-sidebar"
        style={{
          display: willBeAbleToPushContentWithSideBar ? "block" : "none"
        }}
      ></div>
      <div className="boundary-wrapper">
        <div className="chat-messages">

         {chatHistory && chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === 'user' ? 'You' : 'AI'}</div>
            <div className="message-content">
              <p>{msg.content}</p>
                  {msg.role === 'assistant' && (
                    
                   <div className="audio-controls">
                       {/* <button onClick={() => readAIResponseAloud(msg.content)}>🔊</button>
                        <button onClick={togglePauseResume} disabled={!audio}>
                          {isPaused ? "Resume" : "Pause"}
                        </button> */}
                 </div>
                )}
            </div>
          </div>
        ))}

          {/* <div className="message user">
            <div className="message-content">
              <p>Can you summarize the main points of the document?</p>
            </div>
          </div> */}
        </div>

        <div className="action-bar">
          <div className="input-container">
          
            <Recording setQns={ HandleQn } />
              <button className="send-btn" onClick={handleSend}>
                <ArrowRight size={20} />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
