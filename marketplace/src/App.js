// marketplace/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!chatMessage.trim() || !userEmail) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/marketplace-chat`, {
        query: chatMessage,
        user_email: userEmail
      });

      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: chatMessage },
        { role: 'assistant', content: response.data.response }
      ]);
      setChatMessage('');
    } catch (error) {
      console.error('Chat failed:', error);
    }
    setLoading(false);
  };

  const generateApp = async (type, description) => {
    if (!userEmail) {
      alert('Please enter your email first');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/generate-app`, {
        app_type: type,
        description: description,
        requirements: ['docker'],
        recipient_email: userEmail
      });
      alert('App generation started! Check your email.');
    } catch (error) {
      console.error('Generation failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🤖 AI Email Marketplace</h1>
        <input
          type="email"
          placeholder="Your email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="email-input"
        />
      </header>

      <div className="main-content">
        <div className="chat-section">
          <h2>💬 Chat with AI</h2>
          <div className="chat-history">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <strong>{msg.role === 'user' ? '👤 You' : '🤖 AI'}:</strong>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Describe the app you need..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? '⏳' : 'Send'}
            </button>
          </div>
        </div>

        <div className="quick-apps">
          <h2>🚀 Quick Generate</h2>
          <div className="app-buttons">
            <button onClick={() => generateApp('dashboard', 'Web dashboard with charts')}>
              📊 Dashboard
            </button>
            <button onClick={() => generateApp('api', 'REST API service')}>
              🔌 API Service
            </button>
            <button onClick={() => generateApp('tool', 'Data analysis tool')}>
              📈 Data Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;