import React from 'react';

const NotificationList = ({ newMessages, onSelectUser }) => {
  return (
    <div>
      <h3>New Messages</h3>
      <ul>
        {Object.keys(newMessages).map((userId) => (
          <li key={userId} onClick={() => onSelectUser({ userId })}>
            User {userId} ({newMessages[userId]} new messages)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
