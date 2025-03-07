import { useState, useEffect } from "react";
import { encode } from "gpt-tokenizer";
import './even.css';
import AudioMessage from './AudioMessage';
import VoiceIndicator from './VoiceIndicator';

function Message({ event, audioStream }) {
  // Add token calculation to the component
  const [eventTokens, setEventTokens] = useState(0);

  useEffect(() => {
    try {
      const tokens = encode(JSON.stringify(event)).length;
      setEventTokens(tokens);
      
      // Optional: Log tokens for each message
      console.log(`Message Tokens (${event.type}):`, tokens);
    } catch (error) {
      console.error('Error calculating message tokens:', error);
    }
  }, [event]);

  // Handle user text messages
  if (event.type === "conversation.item.create" && event.item?.role === "user") {
    return (
      <div className="message-wrapper user">
        <div className="user-message">
          <div className="message-content">
            {event.item.content[0].text}
            {audioStream && <AudioMessage stream={audioStream} />}
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="token-info">
            Tokens: {eventTokens}
          </div>
        )}
      </div>
    );
  }

  // Handle AI responses (both text and transcribed audio)
  if (event.type === "response.audio_transcript.done" || 
      (event.type === "content.part" && event.content?.text)) {
    return (
      <div className="message-wrapper ai">
        <div className="ai-message">
          <div className="message-content">
            {event.transcript || event.content.text}
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="token-info">
            Tokens: {eventTokens}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function EventLog({ events, isTranscribing, audioStreams, isTunnelConnected }) {
  // Modify session tokens tracking to include categories
  const [sessionTokens, setSessionTokens] = useState({
    input: {
      total: 0,
      breakdown: []
    },
    output: {
      total: 0,
      breakdown: []
    },
    cache: {
      total: 0,
      breakdown: []
    },
    total: {
      tokens: 0
    }
  });

  useEffect(() => {
    try {
      // Categorize token breakdown
      const tokenBreakdown = {
        input: [],
        output: [],
        cache: []
      };

      const categorizeTokens = events.map(event => {
        const tokens = encode(JSON.stringify(event)).length;
        
        // Categorize tokens
        let category = 'input'; // Default to input
        if (event.type === 'cache_retrieval') {
          category = 'cache';
        } else if (event.type === 'response.create' || event.type === 'content.part') {
          category = 'output';
        }

        return { 
          type: event.type, 
          tokens, 
          category 
        };
      });

      // Separate tokens by category
      const categorizedTokens = categorizeTokens.reduce((acc, token) => {
        acc[token.category].push(token);
        return acc;
      }, {
        input: [],
        output: [],
        cache: []
      });

      // Calculate total tokens for each category
      const sessionTokenBreakdown = {
        input: {
          total: categorizedTokens.input.reduce((sum, event) => sum + event.tokens, 0),
          breakdown: categorizedTokens.input
        },
        output: {
          total: categorizedTokens.output.reduce((sum, event) => sum + event.tokens, 0),
          breakdown: categorizedTokens.output
        },
        cache: {
          total: categorizedTokens.cache.reduce((sum, event) => sum + event.tokens, 0),
          breakdown: categorizedTokens.cache
        },
        total: {
          tokens: categorizeTokens.reduce((sum, event) => sum + event.tokens, 0)
        }
      };

      setSessionTokens(sessionTokenBreakdown);

      // Log total tokens periodically with detailed breakdown
      if (events.length % 5 === 0) {
        console.log('Detailed Session Token Breakdown:', {
          input: {
            totalTokens: sessionTokenBreakdown.input.total,
            eventCount: categorizedTokens.input.length
          },
          output: {
            totalTokens: sessionTokenBreakdown.output.total,
            eventCount: categorizedTokens.output.length
          },
          cache: {
            totalTokens: sessionTokenBreakdown.cache.total,
            eventCount: categorizedTokens.cache.length
          },
          total: sessionTokenBreakdown.total.tokens
        });
      }
    } catch (error) {
      console.error('Error calculating session tokens:', error);
    }
  }, [events]);

  return (
    <div className="chat-container">
      {isTunnelConnected && <VoiceIndicator isActive={true} />}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="session-token-info">
          <div>Input Tokens: {sessionTokens.input.total}</div>
          <div>Output Tokens: {sessionTokens.output.total}</div>
          <div>Cache Tokens: {sessionTokens.cache.total}</div>
          <div>Total Tokens: {sessionTokens.total.tokens}</div>
        </div>
      )}

      <div className="messages-container">
        {events.length === 0 ? (
          <div className="empty-state">
            <span>Start a conversation...</span>
          </div>
        ) : (
          <div className="messages-list">
            {events.map((event, index) => (
              <Message 
                key={event.event_id || index} 
                event={event} 
                audioStream={audioStreams[event.event_id]}
              />
            ))}
            {isTranscribing && (
              <div className="message-wrapper ai">
                <div className="ai-message">
                  <div className="typing-indicator">
                    <span>AI is typing</span>
                    <div className="dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
