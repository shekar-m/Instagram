import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../Socket'; // Import the socket instance

const Messages = ({ currentUser, setCurrentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8001/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (otherUser && otherUser._id) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`http://localhost:8001/messages/${otherUser._id}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [otherUser]);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      socket.emit('join', currentUser._id);

      socket.on('receiveMessage', (message) => {
        if (message.sender === otherUser._id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [currentUser, otherUser]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !file) return;

    let mediaUrl = null;
    if (file) {
      const formData = new FormData();
      formData.append('media', file);
      const uploadResponse = await axios.post('http://localhost:8001/upload-media', formData);
      mediaUrl = uploadResponse.data.mediaUrl;
    }

    try {
      socket.emit('sendMessage', {
        senderId: currentUser._id,
        receiverId: otherUser._id,
        content: newMessage,
        mediaUrl: mediaUrl
      });
      setMessages([...messages, { sender: currentUser._id, content: newMessage, mediaUrl: mediaUrl }]);
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUserSelection = (user) => {
    setOtherUser(user);
  };

  if (!currentUser) {
    return <div>Loading...</div>; // Or some other placeholder or message
  }

  return (
    <div className="messages-container">
      <div className="users-list">
        <h2>Select a user to chat with</h2>
        {users.map((user) => (
          <div key={user._id} onClick={() => handleUserSelection(user)}>
            {user.username}
          </div>
        ))}
      </div>
      <div className="messages-list">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-item ${message.sender === currentUser._id ? 'sent' : 'received'}`}
          >
            {message.mediaUrl && <img src={message.mediaUrl} alt="Media" />}
            {message.content}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Messages;
