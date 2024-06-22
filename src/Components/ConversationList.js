import axios from 'axios';
import axiosInstance from './Interceptors/axiosInterceptor';
import { useEffect, useState } from 'react';

const ConversationList = ({ userId }) => {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:8001/conversations/${userId}`);
        setConversations(response.data);
      } catch (error) {
        setError(error);
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [userId]);

  if (error) {
    return <div>Error fetching conversations: {error.message}</div>;
  }

  return (
    <div className='container-fluid bg-danger'>
      <h2>Conversations</h2>
      <ul>
        {conversations.map(conversation => (
          <li key={conversation._id}>{conversation.latestMessage?.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
