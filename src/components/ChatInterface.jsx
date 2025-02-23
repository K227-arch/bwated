import { ArrowUp, Mic, Send, StopCircle } from "lucide-react";
import "./ChatInterface.css";

const LOCAL_RELAY_SERVER_URL =
  import.meta.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

  import { RealtimeClient } from '@openai/realtime-api-beta';
  // import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
  import { WavRecorder, WavStreamPlayer } from '@/lib/index.js';
  import { instructions } from '@/utils/conversation_config.js';
  import { WavRenderer } from '@/utils/wav_renderer';
  
   import { Button } from '@/components/chatComponentes/button/Button';
  import { Toggle } from '@/components/chatComponentes/toggle/Toggle';
  import './ConsolePage.scss'

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Recording from "../components/Recording";
import "./ChatInterface.css";
import OpenAI from "openai"; 
import axios from "axios";

 
export default function ChatInterface( {docId}) {

  console.log(docId)
  /**
   * Ask user for API Key
   * If we're using the local relay server, we don't need this
   */
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  //   ? ''
  //   : localStorage.getItem('tmp::voice_api_key') ||
  //     prompt('OpenAI API Key') ||
  //     '';
  // if (apiKey !== '') {
  //   localStorage.setItem('tmp::voice_api_key', apiKey);
  // }

  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true,
           }
    )
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef(null);
  const serverCanvasRef = useRef(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef(null);
  const startTimeRef = useRef(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */
  const [items, setItems] = useState ([]);
  const [realtimeEvents, setRealtimeEvents] = useState ([]);
  const [expandedEvents, setExpandedEvents] = useState ({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState ({});
  const [coords, setCoords] = useState ({
    lat: 37.775593,
    lng: -122.418137,
  });
  const [marker, setMarker] = useState (null);

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp ) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n ) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * When you click the API key
   */
  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const story = ` `;

    client.updateSession({model: 'gpt-4o-mini-realtime-preview-2024-12-17'})
    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `hello`,
        // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
      },
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);
    setMemoryKv({});
    
    setMarker(null);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setCanPushToTalk(value === 'none');
  };

  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el ;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx  = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx  = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              10,
              0,
              8
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              10,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves important data about the user into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The key of the memory value. Always use lowercase and underscores, no other characters.',
            },
            value: {
              type: 'string',
              description: 'Value can be anything represented as a string',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value } ) => {
        setMemoryKv((memoryKv) => {
          const newKv = { ...memoryKv };
          newKv[key] = value;
          return newKv;
        });
        return { ok: true };
      }
    );
    // client.addTool(
    //   {
    //     name: 'get_weather',
    //     description:
    //       'Retrieves the weather for a given lat, lng coordinate pair. Specify a label for the location.',
    //     parameters: {
    //       type: 'object',
    //       properties: {
    //         lat: {
    //           type: 'number',
    //           description: 'Latitude',
    //         },
    //         lng: {
    //           type: 'number',
    //           description: 'Longitude',
    //         },
    //         location: {
    //           type: 'string',
    //           description: 'Name of the location',
    //         },
    //       },
    //       required: ['lat', 'lng', 'location'],
    //     },
    //   },
    //   async ({ lat, lng, location } ) => {
    //     setMarker({ lat, lng, location });
    //     setCoords({ lat, lng, location });
    //     const result = await fetch(
    //       `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
    //     );
    //     const json = await result.json();
    //     const temperature = {
    //       value: json.current.temperature_2m ,
    //       units: json.current_units.temperature_2m  ,
    //     };
    //     const wind_speed = {
    //       value: json.current.wind_speed_10m ,
    //       units: json.current_units.wind_speed_10m  ,
    //     };
    //     setMarker({ lat, lng, location, temperature, wind_speed });
    //     return json;
    //   }
    // );

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta } ) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

  /**
   * Render the application
   */
  return (
    <div className="chat-layout">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <h2>AI Chat Assistant</h2>
            <div className="connection-indicator">
              <span className={`status-dot ${isConnected ? 'active' : ''}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        <div className="messages-wrapper">
          {items.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-illustration">
                <svg>...</svg>
              </div>
              <h3>Start Your Conversation</h3>
              <p>Ask questions about your document or start a voice chat</p>
            </div>
          ) : (
            <div className="messages-container">
              {items.map((message) => (
                <div 
                  key={message.id} 
                  className={`message-bubble ${message.role}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="message-time">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="message-text">
                      {message.formatted.transcript || message.formatted.text}
                    </div>

                    {message.formatted.file && (
                      <div className="audio-player">
                        <audio 
                          src={message.formatted.file.url} 
                          controls 
                          className="modern-audio-player"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-footer">
          <div className="controls-container">
            <div className="main-controls">
              <button
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                disabled={!isConnected || !canPushToTalk}
              >
                {isRecording ? (
                  <StopCircle className="icon" />
                ) : (
                  <Mic className="icon" />
                )}
                {isRecording ? 'Stop' : 'Hold to Talk'}
              </button>

              <button
                className={`connect-button ${isConnected ? 'connected' : ''}`}
                onClick={isConnected ? disconnectConversation : connectConversation}
              >
                {isConnected ? 'End Chat' : 'Start Chat'}
              </button>
            </div>

            <div className="mode-selector">
              <span className="mode-label">Mode:</span>
              <div className="mode-buttons">
                <button 
                  className={`mode-button ${canPushToTalk ? 'active' : ''}`}
                  onClick={() => changeTurnEndType('none')}
                >
                  Manual
                </button>
                <button 
                  className={`mode-button ${!canPushToTalk ? 'active' : ''}`}
                  onClick={() => changeTurnEndType('server_vad')}
                >
                  Auto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}