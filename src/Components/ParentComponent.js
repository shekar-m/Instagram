import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Chatbox from "./Chatbox";

const ParentComponent = () => {
  const [newMessages, setNewMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const handleNewMessage = (userId) => {
    setNewMessages((prevState) => ({
      ...prevState,
      [userId]: (prevState[userId] || 0) + 1,
    }));
  };

  return (
    <div>
      {selectedUser && (
        <Chatbox
          userId="currentUserId"
          selectedUser={selectedUser}
          onBack={() => setSelectedUser(null)}
          onNewMessage={handleNewMessage}
        />
      )}
    </div>
  );
};

export default ParentComponent;
