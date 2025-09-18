import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaRobot } from 'react-icons/fa'; // icons
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you with Brownson products or your orders?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);

    try {
      const user = JSON.parse(localStorage.getItem('User'));
      const userId = user?._id;

      if (!userId) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'You are not logged in. Please log in to use this feature.' }]);
        return;
      }

      const res = await axios.post('http://localhost:4000/api/chatbot/message', {
        message: input,
        userId: userId, // ✅ send user ID to backend
      });

      const botReply = res.data.reply;
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbot">
      <div className="chatbot-container">
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.sender}`}>
              <div className="icon">
                {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
              </div>
              <div className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            placeholder="Ask something..."
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
