// import React, { useState } from "react";
// import Sidebar from "./Sidebar";
// import Post from "./Post";
// import Search from "./Search";
// import ProfileHandler from "./ProfileHandler"; // Import the new ProfileHandler component
// import UserList from "./UserList";
// import ChatBox from "./Chatbox";
// import "./Sidebar.css";
// import "./Post.css";
// import "./Home.css";
// import NotificationList from "./NotificationList";
// const Home = () => {
//   const [activeComponent, setActiveComponent] = useState("Post");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newMessages, setNewMessages] = useState({});
//   const userId = localStorage.getItem("userId");
//   const handleBack = () => {
//     setSelectedUser(null);
//   };
//   const handleUserSelectFromSearch = (user) => {
//     setSelectedUser(user);
//     setActiveComponent("Messages");
//   };
//   const handleNewMessage = (senderId) => {
//     setNewMessages((prevMessages) => ({
//       ...prevMessages,
//       [senderId]: (prevMessages[senderId] || 0) + 1,
//     }));
//   };
//   const handleMenuClick = (component) => {
//     if (component === 'Notifications') {
//       setActiveComponent('NotificationList');
//     } else if (component === 'Messages') {
//       setNewMessages({});
//     }
//     setActiveComponent(component);
//   };
//   return (
//     <div>
//     <Sidebar onMenuClick={handleMenuClick} newMessageCount={Object.keys(newMessages).length} />
//     <div className="content-container container-fluid">
//       {activeComponent === "Post" && <Post />}
//       {activeComponent === "Search" && <Search onSelectUser={handleUserSelectFromSearch} />}
//       {activeComponent === "Profile" && <ProfileHandler />}
//       {activeComponent === "Messages" && (
//         <div className="messages-container">
//           {!selectedUser && (
//             <UserList 
//               onSelectUser={(user) => {
//                 setSelectedUser(user);
//                 handleNewMessage(user.userId);
//               }} 
//               className="m-3" 
//             />
//           )}
//           {selectedUser && (
//             <div className="container-fluid z-5 me-3">
//               <ChatBox 
//                 userId={userId} 
//                 selectedUser={selectedUser} 
//                 onBack={handleBack} 
//                 onNewMessage={handleNewMessage} 
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   </div>
//   );
// };
// export default Home;     
//shekar here main code here
// import React, { useState } from "react";
// import Sidebar from "./Sidebar";
// import Post from "./Post";
// import Search from "./Search";
// import ProfileHandler from "./ProfileHandler"; // Import the new ProfileHandler component
// import UserList from "./UserList";
// import ChatBox from "./Chatbox";
// import "./Sidebar.css";
// import "./Post.css";
// import "./Home.css";
// import { Routes, Route, useNavigate } from "react-router-dom"; // Import useNavigate
// const Home = () => {
//   const [activeComponent, setActiveComponent] = useState("Post");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newMessages, setNewMessages] = useState({});
//   const userId = localStorage.getItem("userId");
//   const [selectedPost, setSelectedPost] = useState(null); // Added to store the selected post for sharing
//   const handleBack = () => {
//     setSelectedUser(null);
//     setSelectedPost(null); // Reset selected post when navigating back
//   }; 
//   const handleUserSelectFromSearch = (user) => {
//     setSelectedUser(user);
//     setActiveComponent("Messages");
//   };
//   const handleNewMessage = (senderId) => {
//     setNewMessages((prevMessages) => ({
//       ...prevMessages,
//       [senderId]: (prevMessages[senderId] || 0) + 1,
//     }));
//   };
//   const handleMenuClick = (component) => {
//     if (component === 'Messages') {
//       setNewMessages({});
//       setActiveComponent('Messages');
//     } else {
//       setActiveComponent(component);
//     }
//   };
//   const handleSharePost = (user, post) => {
//     console.log("Selected User=======>:", user);
//     console.log("Selected Post=======>:", post);
//     setSelectedUser(user); // Set the selected user to navigate to ChatBox
//     setSelectedPost(post); // Store the selected post to be shared in ChatBox
//     setTimeout(() => {
//       setActiveComponent("Messages");
//     }, 0);
//   };
//   const handlePostShared = () => {
//     setSelectedPost(null);
//   };
//    // Callback to handle when a post in the chat is clicked
//    const handlePostClickInChat = (post) => {
//     setSelectedPost(post);
//     setActiveComponent("Post"); // Switch to the Post component to display the selected post
//   };
//   return (
//     <div>
//       <Sidebar onMenuClick={handleMenuClick} newMessageCount={Object.keys(newMessages).length} />
//       <div className="content-container container-fluid">
//         {activeComponent === "Post" && <Post onSharePost={handleSharePost} selectedPost={selectedPost} />}
//         {activeComponent === "Search" && <Search onSelectUser={handleUserSelectFromSearch} />}
//         {activeComponent === "Profile" && <ProfileHandler />}
//         {activeComponent === "Messages" && (
//           <div className="messages-container">
//             {!selectedUser && (
//               <UserList 
//                 onSelectUser={(user) => {
//                   setSelectedUser(user);
//                   handleNewMessage(user.userId);
//                 }} 
//                 className="m-3"
//               />
//             )}
//             {selectedUser && (
//               <div className="container-fluid z-5 me-3">
//                 <ChatBox 
//                   userId={userId} 
//                   selectedUser={selectedUser} 
//                   selectedPost={selectedPost} // Pass the selected post to ChatBox
//                   onBack={handleBack} 
//                   onNewMessage={handleNewMessage} 
//                   onPostShared={handlePostShared}
//                   onPostClickInChat={handlePostClickInChat} // Pass the callback to ChatBox
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default Home;
"use strict";