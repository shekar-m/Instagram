import { React, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Post from "./Post";
import Search from "./Search";
import ProfileHandler from "./ProfileHandler";
import UserList from "./UserList";
import ChatBox from "./Chatbox";
import "./Sidebar.css";
import "./Post.css";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessages, setNewMessages] = useState({});
  const userId = localStorage.getItem("userId");
  const [selectedPost, setSelectedPost] = useState(null);

  const handleBack = () => {
    setSelectedUser(null);
    setSelectedPost(null);
  };

  const handleUserSelectFromSearch = (user) => {
    setSelectedUser(user);
    navigate("/home/messages");
  };

  const handleNewMessage = (senderId) => {
    setNewMessages((prevMessages) => ({
      ...prevMessages,
      [senderId]: (prevMessages[senderId] || 0) + 1,
    }));
  };

  const handleMenuClick = (component) => {
    navigate(`/home/${component.toLowerCase()}`);
  };

  const handleSharePost = (user, post) => {
    setSelectedUser(user);
    setSelectedPost(post);
    navigate("/home/messages");
  };

  const handlePostShared = () => {
    setSelectedPost(null);
  };

  const handlePostClickInChat = (post) => {
    setSelectedPost(post);
    navigate("/home/post");
  };

  return (
    <div className="home-page d-flex flex-column flex-md-row ">
      <aside className="sidebar-container bg-light p-3 flex-shrink-0 ">
        <Sidebar
          onMenuClick={handleMenuClick}
          newMessageCount={Object.keys(newMessages).length}
        />
      </aside>

      <main className="content-container flex-grow-1 ">
        <Routes>
          <Route
            path="post"
            element={
              <Post onSharePost={handleSharePost} selectedPost={selectedPost} />
            }
          />
          <Route
            path="search"
            element={<Search onSelectUser={handleUserSelectFromSearch} />}
          />
          <Route path="profile" element={<ProfileHandler />} />
          <Route
            path="messages"
            element={
              <div className="messages-container d-flex">
                {!selectedUser && (
                  <UserList
                    onSelectUser={(user) => {
                      setSelectedUser(user);
                      handleNewMessage(user.userId);
                    }}
                    className="user-list bg-white border"
                  />
                )}
                {selectedUser && (
                  <div className="chatbox-container flex-grow-1">
                    <ChatBox
                      userId={userId}
                      selectedUser={selectedUser}
                      selectedPost={selectedPost}
                      onBack={handleBack}
                      onNewMessage={handleNewMessage}
                      onPostShared={handlePostShared}
                      onPostClickInChat={handlePostClickInChat}
                    />
                  </div>
                )}
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default Home;
