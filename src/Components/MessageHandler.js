import React, { useState, useEffect } from "react";
import socket from "../Socket";
import Chatbox from "./Chatbox";
import UserList from "./UserList";

const MessageHandler = () => {
  const [users, setUsers] = useState([]); // Centralized user list
  const [selectedUser, setSelectedUser] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      const senderId = message.sender;

      setUsers((prevUsers) => {
        const senderIndex = prevUsers.findIndex(
          (user) => user.userId === senderId
        );

        if (senderIndex !== -1) {
          const updatedUsers = [...prevUsers];
          const [sender] = updatedUsers.splice(senderIndex, 1);
          updatedUsers.unshift(sender);
          return updatedUsers;
        }

        return prevUsers;
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="message-container">
      <UserList users={users} onSelectUser={handleUserSelect} />
      {selectedUser && <Chatbox selectedUser={selectedUser} userId={userId} />}
    </div>
  );
};

export default MessageHandler;
