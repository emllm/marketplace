// email-marketplace/src/App.js - React Email Marketplace Client
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

function App() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [marketplaceApps, setMarketplaceApps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState('inbox');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [loading, setLoading] = useState(false);
  const websocket = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    websocket.current = new WebSocket(WS_URL);

    websocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Load initial data
    loadMarketplaceApps();
    loadEmails();

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    if (data.type === 'generation_started' || data.type === 'generation_completed') {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: data.type,
        message: data.status,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const loadEmails = async () => {
    try {
      // In a real implementation, this would connect to IMAP
      // For demo purposes, we'll simulate email data
      const mockEmails = [
        {
          id: '1',
          from: 'ai-system@company.com',
          subject: 'AI Generated Dashboard Application',
          date: new Date().toISOString(),
          hasAttachment: true,
          isAIGenerated: true,
          body: 'Your custom dashboard application is ready for deployment.',
          attachments: [
            { name: 'dashboard-app.zip', size: '2.4MB', type: 'application/zip' }
          ]
        },
        {
          id: '2',
          from: 'ai-system@company.com',
          subject: 'Data Analysis Tool - Python',
          date: new Date(Date.now() - 86400000).toISOString(),
          hasAttachment: true,
          isAIGenerated: true,
          body: 'Your data analysis tool with pandas and matplotlib is ready.',
          attachments: [
            { name: 'data-tool.zip', size: '1.8MB', type: 'application/zip' }
          ]
        }
      ];
      setEmails(mockEmails);
    } catch (error) {
      console.error('Failed to load emails:', error);
    }
  };

  const loadMarketplaceApps = async () => {
    try {
      const response = await axios.get(`${API_URL}/marketplace-apps`);
      setMarketplaceApps(response.data.apps);
    } catch (error) {
      console.error('Failed to load marketplace apps:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !userEmail) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/marketplace-chat`, {
        query: chatMessage,
        user_email: userEmail,
        conversation_id: conversationId
      });

      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: chatMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response.data.response, timestamp: response.data.timestamp }
      ]);

      setConversationId(response.data.conversation_id);
      setChatMessage('');
    } catch (error) {
      console.error('Chat failed:', error);
    }
    setLoading(false);
  };

  const generateApp = async (appType, description) => {
    if (!userEmail) {
      alert('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate-app`, {
        app_type: appType,
        description: description,
        requirements: ['docker', 'python'],
        recipient_email: userEmail,
        deployment_target: 'docker'
      });

      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'generation_started',
        message: `Application generation started. Request ID: ${response.data.request_id}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('App generation failed:', error);
    }
    setLoading(false);
  };

  const deployApplication = async (email) => {
    if (!email.hasAttachment) return;

    try {
      // In a real implementation, this would extract and deploy the application
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'deployment_started',
        message: `Deploying application: ${email.subject}`,
        timestamp: new Date().toISOString()
      }]);

      // Simulate deployment process
      setTimeout(() => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'deployment_completed',
          message: `Application deployed successfully: ${email.subject}`,
          timestamp: new Date().toISOString()
        }]);
      }, 3000);
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  const EmailInbox = () => (
    <div className="email-inbox">
      <h2>📧 AI Application Inbox</h2>
      <div className="email-list">
        {emails.map(email => (
          <div
            key={email.id}
            className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''} ${email.isAIGenerated ? 'ai-generated' : ''}`}
            onClick={() => setSelectedEmail(email)}
          >
            <div className="email-header">
              <div className="email-from">
                {email.isAIGenerated && <span className="ai-badge">🤖 AI</span>}
                {email.from}
              </div>
              <div className="email-date">{new Date(email.date).toLocaleDateString()}</div>
            </div>
            <div className="email-subject">{email.subject}</div>
            {email.hasAttachment && <div className="attachment-indicator">📎 Attachment</div>}
          </div>
        ))}
      </div>

      {selectedEmail && (
        <div className="email-detail">
          <h3>{selectedEmail.subject}</h3>
          <div className="email-meta">
            <span>From: {selectedEmail.from}</span>
            <span>Date: {new Date(selectedEmail.date).toLocaleString()}</span>
          </div>
          <div className="email-body">{selectedEmail.body}</div>

          {selectedEmail.attachments && (
            <div className="attachments">
              <h4>Attachments:</h4>
              {selectedEmail.attachments.map((attachment, idx) => (
                <div key={idx} className="attachment">
                  <span>📎 {attachment.name} ({attachment.size})</span>
                  <button
                    className="btn-deploy"
                    onClick={() => deployApplication(selectedEmail)}
                  >
                    🚀 Deploy Application
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const MarketplaceChat = () => (
    <div className="marketplace-chat">
      <h2>🛒 AI Application Marketplace</h2>
      <div className="chat-container">
        <div className="chat-history">
          {chatHistory.map((message, idx) => (
            <div key={idx} className={`chat-message ${message.role}`}>
              <div className="message-header">
                <span className="role">{message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}</span>
                <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-header">
                <span className="role">🤖 AI Assistant</span>
              </div>
              <div className="message-content typing">Thinking...</div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Describe the application you need..."
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
          />
          <button onClick={sendChatMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick App Templates</h3>
        <div className="template-grid">
          <button
            className="template-btn"
            onClick={() => generateApp('web_dashboard', 'Interactive web dashboard with charts and data visualization')}
          >
            📊 Dashboard
          </button>
          <button
            className="template-btn"
            onClick={() => generateApp('api_service', 'REST API service with authentication and database integration')}
          >
            🔌 API Service
          </button>
          <button
            className="template-btn"
            onClick={() => generateApp('data_tool', 'Data analysis tool with pandas and machine learning capabilities')}
          >
            📈 Data Tool
          </button>
          <button
            className="template-btn"
            onClick={() => generateApp('automation_script', 'Automation script for repetitive tasks and workflows')}
          >
            ⚡ Automation
          </button>
        </div>
      </div>
    </div>
  );

  const MarketplaceApps = () => (
    <div className="marketplace-apps">
      <h2>🌟 Featured Applications</h2>
      <div className="apps-grid">
        {marketplaceApps.map(app => (
          <div key={app.id} className="app-card">
            <h3>{app.name}</h3>
            <div className="app-type">{app.type}</div>
            <div className="app-description">{app.description}</div>
            <div className="app-meta">
              <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
            </div>
            <button
              className="btn-request"
              onClick={() => generateApp(app.type, app.description)}
            >
              🚀 Request Similar App
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const Notifications = () => (
    <div className="notifications">
      <h2>🔔 Notifications</h2>
      <div className="notification-list">
        {notifications.slice(-10).map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <h1>🤖 AI Email Application Distribution</h1>
        <div className="user-settings">
          <input
            type="email"
            placeholder="Your email address"
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value);
              localStorage.setItem('userEmail', e.target.value);
            }}
          />
        </div>
      </header>

      <nav className="main-nav">
        <button
          className={currentView === 'inbox' ? 'active' : ''}
          onClick={() => setCurrentView('inbox')}
        >
          📧 Inbox
        </button>
        <button
          className={currentView === 'marketplace' ? 'active' : ''}
          onClick={() => setCurrentView('marketplace')}
        >
          🛒 Marketplace
        </button>
        <button
          className={currentView === 'apps' ? 'active' : ''}
          onClick={() => setCurrentView('apps')}
        >
          🌟 Featured Apps
        </button>
        <button
          className={currentView === 'notifications' ? 'active' : ''}
          onClick={() => setCurrentView('notifications')}
        >
          🔔 Notifications ({notifications.length})
        </button>
      </nav>

      <main className="main-content">
        {currentView === 'inbox' && <EmailInbox />}
        {currentView === 'marketplace' && <MarketplaceChat />}
        {currentView === 'apps' && <MarketplaceApps />}
        {currentView === 'notifications' && <Notifications />}
      </main>
    </div>
  );
}

export default App;