import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "./Interceptors/axiosInterceptor";
import Socket from "../Socket";
import "./UserList.css";
const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState({});

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users");
        const usersData = response.data;

        const userDetailsMap = {};
        usersData.forEach((user) => {
          userDetailsMap[user.userId] = user;
        });

        setUserDetails(userDetailsMap);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    fetchUsers();
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/conversations");
      const conversations = response.data;

      console.log("here conversation api data==>", conversations);

      const sortedConversations = conversations.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      const sortedUsers = sortedConversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (participant) => participant !== userId
        );
        return {
          userId: otherParticipant,
          latestMessage: conversation.latestMessage,
          updatedAt: conversation.updatedAt,
          fullName: userDetails[otherParticipant]?.fullName || "Unknown User",
          unreadCounts: conversation.unreadCounts,
        };
      });

      console.log(
        "here is sorted users details with unreadcount===>",
        sortedUsers
      );
      setUsers(sortedUsers);
      return sortedUsers;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [userId, userDetails]);

  useEffect(() => {
    if (Object.keys(userDetails).length > 0) {
      fetchConversations();
    }
  }, [fetchConversations, userDetails]);

  useEffect(() => {
    Socket.emit("join", userId);

    Socket.on("connect", () => {
      console.log("Socket connected", Socket.id);
    });

    Socket.on("updateUserList", () => {
      fetchConversations();
    });

    const handleNewMessage = (message) => {
      console.log("New message received or sent:", message);
    };

    Socket.on("messageSent", handleNewMessage);
    Socket.on("receiveMessage", handleNewMessage);

    Socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    Socket.on("reconnect", () => {
      console.log("Socket reconnected");
    });

    Socket.on("messageSent", (message) => {
      console.log("Message sent event:", message);
    });

    Socket.on("receiveMessage", (message) => {
      console.log("Message received event:", message);
    });

    Socket.on("conversationUpdated", ({ userId, conversationId }) => {
      console.log(
        `Conversation ${conversationId} for user ${userId} was updated`
      );
      fetchConversations();
    });

    return () => {
      Socket.off("messageSent", handleNewMessage);
      Socket.off("receiveMessage", handleNewMessage);
      Socket.off("connect");
      Socket.off("updateUserList");
      Socket.off("conversationUpdated");

      Socket.off("disconnect");
      Socket.off("reconnect");
    };
  }, [userId, fetchConversations]);

  const handleSelectUser = async (user) => {
    onSelectUser(user);

    try {
      console.log("before hitting the API to mark conversation as read");

      const respp = await axiosInstance.put(
        `/conversations/${user.userId}/markAsRead`
      );
      console.log("API call to mark conversation as read completed");

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.userId === user.userId) {
            return { ...u, unreadCounts: 0 };
          }
          return u;
        })
      );
      console.log("here total data from marks read api====>", respp);
      Socket.emit("conversationUpdated", {
        userId,
        conversationId: user.userId,
      });

      setTimeout(async () => {
        const k = await fetchConversations();
        console.log("after done all updating in database read count", k);
      }, 300);
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  };

  return (
    <div className="user-list" style={{ width: "570px" }}>
      {users.map((user) => {
        const messageCount = user.unreadCounts || 0;
        return (
          <div
            key={user.userId}
            className={`user-item ${messageCount ? "highlighted" : ""}`}
            onClick={() => handleSelectUser(user)}
          >
            <strong>{user.fullName}</strong> {user.latestMessage?.content}{" "}
            <span>{new Date(user.updatedAt).toLocaleString()}</span>
            {messageCount > 0 && (
              <span span className="message-bubble">
                {messageCount}
              </span> // Show the unread count
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
