import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MessageList.css';

const MessageList = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Retrieve the user ID from local storage (or any other storage mechanism you use)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:8001/messages/${conversation._id}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [conversation]);

  const handleSendMessage = async () => {
    try {
      const response = await axios.post('http://localhost:8001/send-message', {
        receiverId: conversation.participants.find(p => p.userId !== userId).userId,
        content: newMessage,
        mediaUrl: ''
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="message-list">
      <div className="messages">
        {messages.map(message => (
          <div key={message._id} className={`message ${message.sender === userId ? 'sent' : 'received'}`}>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="new-message">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessageList;
