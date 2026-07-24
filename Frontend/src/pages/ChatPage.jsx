// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WebcamFeed from '../components/WebcamFeed';

const BACKEND_URL = 'http://localhost:5000';

const ChatPage = () => {
  const [mode, setMode] = useState('text');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hello! I am Empath, your AI first-aid companion. I'm here 24/7 to listen without judgment. How are you feeling today?"
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const [status, setStatus] = useState('Connected');
  const [dominantEmotion, setDominantEmotion] = useState('neutral');
  const [fusedScores, setFusedScores] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [webcamActive, setWebcamActive] = useState(true);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setStatus('Ready');
      socket.emit('session_start', { mode });
    });

    socket.on('disconnect', () => {
      setStatus('Disconnected');
    });

    socket.on('ai_response', (data) => {
      if (data && data.text) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.text }]);
        setStatus('Ready');
      }
    });

    socket.on('analysis_result', (data) => {
      if (data.transcribed_text) {
        setMessages((prev) => [...prev, { sender: 'user', text: data.transcribed_text }]);
      }
      
      if (data.ai_response) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.ai_response }]);
      }

      if (data.dominant_emotion) {
        setDominantEmotion(data.dominant_emotion);
      }

      if (data.fused_scores) {
        setFusedScores(data.fused_scores);
      }

      setStatus('Ready');
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [mode]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getFrameAsBase64 = () => {
    const video = document.querySelector('video');
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userText = textInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTextInput('');
    setStatus('Analyzing text & face...');

    const imageB64 = getFrameAsBase64();
    socketRef.current.emit('text_input', {
      text: userText,
      image: imageB64
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          const base64Image = getFrameAsBase64();

          if (base64Audio && base64Image) {
            setStatus('Transcribing audio & analyzing multimodal emotions...');
            socketRef.current.emit('stream', {
              audio: base64Audio,
              image: base64Image
            });
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Recording voice... Speak clearly.');
    } catch (err) {
      alert('Microphone access denied or unsupported: ' + err.message);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[750px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-t-2xl">
              <div>
                <h2 className="font-bold text-base flex items-center gap-2">
                  <span>🤖</span> AI-Guided First-Aid Triage
                </h2>
                <p className="text-xs text-indigo-200">Empathic Multimodal Companion (Gemini 1.5 Flash)</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full">
                  Status: {status}
                </span>
                <button
                  onClick={() => setMode(mode === 'text' ? 'voice' : 'text')}
                  className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Switch to {mode === 'text' ? '🎤 Voice Mode' : '📝 Text Mode'}
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <span className="text-xs font-bold text-indigo-600 mb-1 block">
                        Empath AI
                      </span>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
              {mode === 'text' ? (
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type how you are feeling (e.g. 'I am feeling hopeless about exam results')..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                  >
                    Send 🚀
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-4 py-2">
                  {!isRecording ? (
                    <button
                      onClick={startVoiceRecording}
                      className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 animate-pulse"
                    >
                      <span>🎤</span> Start Voice Session
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceRecording}
                      className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <span>🛑</span> Stop & Process Audio
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <WebcamFeed isRunning={webcamActive} />

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Dominant Detected Emotion
              </span>
              <span className="text-2xl font-black text-indigo-700 capitalize">
                {dominantEmotion}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <span>🎨</span> Weighted Fusion Scores
              </h3>

              {Object.keys(fusedScores).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(fusedScores)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([emotion, score]) => {
                      const pct = Math.round(score * 100);
                      return (
                        <div key={emotion}>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1 capitalize">
                            <span>{emotion}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Send a message or voice recording to calculate live multimodal emotion fusion.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ChatPage;
