import React, { useState } from 'react';
import UserList from './UserList';
import ConversationList from './ConversationList';
import './MessagingApp.css';

const MessagingApp = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="messaging-app">
      <div className="user-list-section">
        <UserList onSelectUser={setSelectedUser} />
      </div>
      <div className="conversation-section">
        {selectedUser && (
          <ConversationList userId={selectedUser._id} />
        )}
      </div>
    </div>
  );
};

export default MessagingApp;
