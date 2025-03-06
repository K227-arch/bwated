import { useEffect, useRef, useState } from "react";
import "./ChatInterface.css";
import EventLog from "./chatComponentes/EventLog";
import SessionControls from "./chatComponentes/SessionControls";
import ReactDOMServer from 'react-dom/server';
import { encode, decode } from "gpt-tokenizer";
import { supabase } from '@/lib/supabaseClient';

// Add these constants at the top
const MAX_TOKENS_PER_CHUNK = 2000; // Conservative limit for GPT-4
const CHUNK_OVERLAP = 200; // Tokens of overlap between chunks

// Add Supabase client setup near the top
 
function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioStreams, setAudioStreams] = useState({});
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Add new states for text processing
  const [processedText, setProcessedText] = useState('');
  const [textChunks, setTextChunks] = useState([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  // Add new states for document tracking
  const [docId, setDocId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Add loading states
  const [loadingStates, setLoadingStates] = useState({
    connection: false,
    history: false,
    processing: false,
    saving: false,
    chunking: false
  });
  const [progress, setProgress] = useState({
    chunks: 0,
    processing: 0
  });

  // Add loading indicator components
  const LoadingSpinner = ({ size = '24px', color = '#3498db' }) => (
    <div 
      className="loading-spinner" 
      style={{ 
        width: size, 
        height: size, 
        borderColor: color,
        borderTopColor: 'transparent' 
      }} 
    />
  );

  const ProgressBar = ({ progress, label }) => (
    <div className="progress-container">
      <div className="progress-label">{label}</div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="progress-percentage">{Math.round(progress)}%</div>
    </div>
  );

  // Add function to prepare text chunks
  const prepareTextChunks = (text) => {
    console.log('Starting text preparation...');
    const tokens = encode(text);
    console.log('Total tokens in text:', tokens.length);

    const chunks = [];
    let currentChunk = [];
    let tokenCount = 0;

    for (let i = 0; i < tokens.length; i++) {
      currentChunk.push(tokens[i]);
      tokenCount++;

      if (tokenCount >= MAX_TOKENS_PER_CHUNK) {
        chunks.push(currentChunk);
        // Decode and log the chunk content
        const chunkText = decode(currentChunk);
        console.log(`Chunk ${chunks.length} content:`, {
          tokenCount: currentChunk.length,
          preview: chunkText.slice(0, 100) + '...',
          fullText: chunkText
        });
        
        // Keep overlap tokens for context
        currentChunk = tokens.slice(i - CHUNK_OVERLAP, i + 1);
        tokenCount = CHUNK_OVERLAP;
      }
    }

    // Add remaining tokens as final chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
      const chunkText = decode(currentChunk);
      console.log(`Final chunk ${chunks.length} content:`, {
        tokenCount: currentChunk.length,
        preview: chunkText.slice(0, 100) + '...',
        fullText: chunkText
      });
    }

    return chunks;
  };

  // Add function to fetch chat history
  const fetchChatHistory = async (documentId) => {
    setLoadingStates(prev => ({ ...prev, history: true }));
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('doc_id', documentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found - create a new one
          console.log('Creating new chat history for document:', documentId);
          const { data: newData, error: createError } = await supabase
            .from('chat_history')
            .insert([{
              doc_id: documentId,
              messages: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (createError) throw createError;
          return [];
        }
        throw error;
      }

      console.log('Retrieved existing chat history:', data);
      if (data.messages && data.messages.length > 0) {
        // Convert stored messages back to event format
        const formattedMessages = data.messages.map(msg => ({
          type: msg.type,
          item: {
            role: "assistant",
            content: [{
              type: "text",
              text: msg.content
            }]
          },
          timestamp: msg.timestamp,
          event_id: crypto.randomUUID()
        }));
        // setEvents(formattedMessages);
        return formattedMessages;
      }
      return [];
    } catch (error) {
      console.error('Error handling chat history:', error);
      setError('Failed to load chat history');
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, history: false }));
    }
  };

  // Update saveChatHistory to properly handle AI responses
  const saveChatHistory = async (messages) => {
    setLoadingStates(prev => ({ ...prev, saving: true }));
    if (!docId) return;
  
    try {
      // Filter only AI responses with proper content
      const aiResponses = messages.filter(msg => {
        // Check for content.part messages
        if (msg.type === "content.part" && msg.content?.text) {
          return true;
        }
        // Check for conversation items from assistant
        if (msg.type === "conversation.item.create" && 
            msg.item?.role === "assistant" && 
            msg.item?.content?.[0]?.text) {
          return true;
        }
        return false;
      }).map(msg => ({
        type: msg.type,
        content: msg.type === "content.part" ? 
          msg.content.text : 
          msg.item.content[0].text,
        timestamp: msg.timestamp || Date.now()
      }));
  
      console.log('Saving AI responses:', aiResponses);
  
      // Use upsert with ON CONFLICT DO UPDATE
      const { error } = await supabase
        .from('chat_history')
        .upsert({
          doc_id: docId,
          messages: aiResponses,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'doc_id',
          ignoreDuplicates: false
        });
  
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Chat history saved successfully');
    } catch (error) {
      console.error('Error saving chat history:', error);
      setError('Failed to save chat history: ' + error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  // Add function to check if message is related to context
  const isMessageInContext = (message, context) => {
    // Simple check for now - can be made more sophisticated
    const keywords = context.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const messageWords = message.toLowerCase().split(/\W+/);
    
    return keywords.some(keyword => messageWords.includes(keyword));
  };

  // Update sendTextMessage to check context
  function sendTextMessage(message) {
    if (!processedText) {
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "assistant",
          content: [{
            type: "text",
            text: "I don't see any text loaded for us to discuss. Please upload a document first."
          }]
        },
        event_id: crypto.randomUUID()
      });
      return;
    }

    if (!isMessageInContext(message, processedText)) {
      const event = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{
            type: "input_text",
            text: message
          }]
        }
      };

      sendClientEvent(event);
      
      // Send context reminder
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "assistant",
          content: [{
            type: "text",
            text: "I notice your question might not be directly related to the text we're discussing. To help you better, could you please ask something specific about the content we're reviewing? If you'd like to discuss a different topic, we should start a new session with that material."
          }]
        },
        event_id: crypto.randomUUID()
      });
      return;
    }

    // Message is in context, proceed normally
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{
          type: "input_text",
          text: message + " (Please keep your response focused on the text we're discussing.)"
        }]
      }
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // Update the initial useEffect to better handle history loading
  useEffect(() => {
    const initializeChat = async () => {
      const storedText = localStorage.getItem('extractedText') || '';
      const documentId = localStorage.getItem('docId');
      
      if (documentId) {
        console.log('Initializing chat with document ID:', documentId);
        setDocId(documentId);
        const history = await fetchChatHistory(documentId);
        setChatHistory(history);
        
        if (history.length > 0) {
          console.log('Loaded existing chat history:', history.length, 'messages');
        }
      }

      setProcessedText(storedText);
      const chunks = prepareTextChunks(storedText);
      setTextChunks(chunks);
      console.log(`Prepared ${chunks.length} chunks for processing`);
    };

    initializeChat();
  }, []);

  // Add effect to save chat history when events change
  useEffect(() => {
    if (events.length > 0 && docId) {
      // Debounce saving to avoid too many database calls
      const timeoutId = setTimeout(() => {
        saveChatHistory(events);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [events, docId]);

  async function startSession() {
    setLoadingStates(prev => ({ ...prev, connection: true }));
    try {
      setIsConnecting(true);
      setError(null);

      // Get an ephemeral key from the server
      const tokenResponse = await fetch(`https://bwat.netlify.app/.netlify/functions/api/token`);
      if (!tokenResponse.ok) {
        throw new Error('Failed to get authentication token');
      }
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create and configure peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      // console.log(pc)

      // Set up audio element
      const audio = new Audio();
      audio.autoplay = true;
      audioElement.current = audio;

      // Handle remote stream
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          stopSession();
          setError('Connection failed. Please try again.');
        }
      };

      // Set up media stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        // Create MediaRecorder instance
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioStream = new MediaStream([audioBlob]);
          
          // Store the audio stream with the latest event ID
          const latestEventId = events[0]?.event_id;
          if (latestEventId) {
            setAudioStreams(prev => ({
              ...prev,
              [latestEventId]: audioStream
            }));
          }
          
          audioChunks = [];
        };

        // Store mediaRecorder in ref for later use
        mediaRecorderRef.current = mediaRecorder;
        
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      } catch (mediaError) {
        throw new Error('Microphone access denied');
      }

      // Set up data channel
      const dc = pc.createDataChannel("oai-events", {
        ordered: true,
        maxRetransmits: 3  // Add retry attempts
      });
      
      dc.onopen = () => {
        console.log('Data channel opened');
        setIsSessionActive(true);
        setEvents([]);
        // Don't send message immediately, wait for stable connection
        setTimeout(() => {
          if (dc.readyState === 'open') {
            sendInitialPrompt(dc);
          }
        }, 1000);
      };

      dc.onclose = () => {
        console.log('Data channel closed');
        setError('Connection closed. Please try again.');
        stopSession();
      };

      dc.onerror = (err) => {
        console.error('Data channel error:', err);
        setError('Connection error occurred. Please try again.');
        stopSession();
      };

      setDataChannel(dc);

      // Create and set offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true
      });
      await pc.setLocalDescription(offer);

      // Send offer to server
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to establish connection with OpenAI');
      }

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;

    } catch (error) {
      console.error('Session start error:', error);
      setError(error.message);
      stopSession();
    } finally {
      setIsConnecting(false);
      setLoadingStates(prev => ({ ...prev, connection: false }));
    }
  }

  // Update sendInitialPrompt to include chat history context
  function sendInitialPrompt(dc) {
    console.log('Starting text processing sequence...');
    
    if (!textChunks.length) {
      console.log('No chunks to process');
      return;
    }

    const initialPrompt = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{
          type: "input_text",
          text: `You are my tutor.Always speak in English and  Keep responses short and precise unless asked for more detail. and if asked something unrelated with the context kindly tell the user to ask questions related to the content ${
            chatHistory.length > 0 
              ? "We've discussed this text before - continue from our previous conversation." 
              : "I will share a text for you to help me understand."
          }`
        }]
      },
      event_id: crypto.randomUUID()
    };
    
    if (dc.readyState === 'open') {
      console.log('Starting background text processing...');
      setCurrentChunkIndex(0);
      setIsProcessingText(true);
      dc.send(JSON.stringify(initialPrompt));
      
      // Update sendChunksSequentially with modified final message
      const sendChunksSequentially = async () => {
        setLoadingStates(prev => ({ ...prev, chunking: true }));
        let processedChunks = 0;

        for (let i = 0; i < textChunks.length; i++) {
          const chunk = textChunks[i];
          const chunkText = decode(chunk);
          
          processedChunks++;
          setProgress(prev => ({
            ...prev,
            chunks: (processedChunks / textChunks.length) * 100
          }));

          console.log(`Sending chunk ${i + 1}/${textChunks.length}`, {
            tokenCount: chunk.length,
            preview: chunkText.slice(0, 100) + '...'
          });

          const message = {
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{
                type: "input_text",
                text: chunkText
              }]
            },
            event_id: crypto.randomUUID()
          };

          try {
            dc.send(JSON.stringify(message));
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error('Error sending chunk:', error);
          }
        }

        // Update final message to request concise summary
        const finalMessage = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{
              type: "input_text",
              text: "Provide a concise summary of the key points from this text. Keep your response focused and brief."
            }]
          },
          event_id: crypto.randomUUID()
        };
        dc.send(JSON.stringify(finalMessage));
        dc.send(JSON.stringify({ 
          type: "response.create",
          event_id: crypto.randomUUID()
        }));
        setIsProcessingText(false);
        setLoadingStates(prev => ({ ...prev, chunking: false }));
      };

      sendChunksSequentially();
    }
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    setIsTranscribing(false);
    
    if (dataChannel) {
      try {
        if (dataChannel.readyState === 'open') {
          dataChannel.close();
        }
      } catch (err) {
        console.warn('Error closing data channel:', err);
      }
      setDataChannel(null);
    }

    if (peerConnection.current) {
      try {
        peerConnection.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        peerConnection.current.close();
      } catch (err) {
        console.warn('Error closing peer connection:', err);
      }
      peerConnection.current = null;
    }

    if (audioElement.current) {
      audioElement.current.srcObject = null;
      audioElement.current = null;
    }

    setAudioStreams({});
    setIsSessionActive(false);
    setEvents([]);
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      console.error('Data channel not available or not open');
      return;
    }

    try {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try reconnecting.');
    }
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener("message", (e) => {
        const eventData = JSON.parse(e.data);
        if (!eventData.timestamp) {
          eventData.timestamp = Date.now();
        }
        if (!eventData.event_id) {
          eventData.event_id = crypto.randomUUID();
        }
        setEvents((prev) => [eventData, ...prev]);
      });

      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
        // Removed sendTextMessage("hey there!")
      });
    }
  }, [dataChannel]);

  useEffect(() => {
    if (events.length > 0) {
      const lastEvent = events[0]; // events are prepended, so latest is at index 0
      
      // Start transcribing when a response.create event is received
      if (lastEvent.type === "response.create") {
        setIsTranscribing(true);
      }
      
      // Stop transcribing when receiving content completion event
      if (lastEvent.type === "content.complete") {
        setIsTranscribing(false);
      }
    }
  }, [events]);

  // Remove or simplify the chunk processing effect since we're handling it differently
  useEffect(() => {
    if (!isProcessingText || !dataChannel) return;

    const lastEvent = events[0];
    console.log('Processing event:', {
      type: lastEvent?.type,
      currentChunk: currentChunkIndex,
      totalChunks: textChunks.length
    });
  }, [events, isProcessingText, currentChunkIndex, textChunks.length, dataChannel]);

  return (
   <div className="chat-interface">
      <nav className="chat-nav">
        <div className="nav-content">
          <h1>AI Tutor Chat</h1>
          {chatHistory.length > 0 && (
            <div className="history-indicator">
              Continuing previous conversation
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          {isLoadingHistory && <div className="loading-message">Loading previous conversation...</div>}
        </div>
      </nav>
      
      {/* Add loading status bar */}
      <div className="loading-status-bar">
        {loadingStates.connection && (
          <div className="loading-item">
            <LoadingSpinner size="20px" />
            <span>Connecting to AI...</span>
          </div>
        )}
        {loadingStates.history && (
          <div className="loading-item">
            <LoadingSpinner size="20px" />
            <span>Loading chat history...</span>
          </div>
        )}
        {loadingStates.chunking && (
          <div className="loading-item">
            <ProgressBar 
              progress={progress.chunks} 
              label="Processing text chunks" 
            />
          </div>
        )}
        {loadingStates.processing && (
          <div className="loading-item">
            <ProgressBar 
              progress={progress.processing} 
              label="AI processing text" 
            />
          </div>
        )}
        {loadingStates.saving && (
          <div className="loading-item">
            <LoadingSpinner size="20px" />
            <span>Saving conversation...</span>
          </div>
        )}
      </div>
      
      <main className="chat-main">
        <section className="chat-messages">
          <EventLog events={events} isTranscribing={isTranscribing} audioStreams={audioStreams} />
        </section>
        
        <section className="chat-controls">
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
            isConnecting={isConnecting}
          />
        </section> 
      </main>
    </div>
  );
}

// Add this export for SSR
export function render(url) {
  const html = ReactDOMServer.renderToString(<App />);
  return { html };
}

export default App;