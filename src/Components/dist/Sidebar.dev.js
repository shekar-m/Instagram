// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faHome, faSearch, faEnvelope, 
//   faBell, faPlusSquare, faUser 
// } from '@fortawesome/free-solid-svg-icons';
// import './Sidebar.css';
// import UploadPost from './UploadPost';
// import Logout from './Logout';
// const Sidebar = ({ onMenuClick, newMessageCount }) => {
//   const [showModal, setShowModal] = useState(false);
//   const navigate = useNavigate();
//   const handleClose = () => setShowModal(false);
//   const handleShow = () => setShowModal(true);
//   const handleUploadSuccess = () => {
//     setShowModal(false);
//     alert("Post successfully uploaded!");
//   };
//   const menuItems = [
//     { name: 'Home', icon: <FontAwesomeIcon icon={faHome} />, action: () => onMenuClick('Post') },
//     { name: 'Search', icon: <FontAwesomeIcon icon={faSearch} />, action: () => onMenuClick('Search') },
//     { name: 'Messages', icon: <FontAwesomeIcon icon={faEnvelope} />, action: () => onMenuClick('Messages') },
//     { name: 'Notifications', icon: <FontAwesomeIcon icon={faBell} />, action: () => onMenuClick('Notifications') },
//     { name: 'Create', icon: <FontAwesomeIcon icon={faPlusSquare} />, action: handleShow },
//     { name: 'Profile', icon: <FontAwesomeIcon icon={faUser} />, action: () => onMenuClick('Profile') },
//   ];
//   return (
//     <div className="sidebar d-flex flex-column vh-100 p-3">
//       <div className="sidebar-header d-flex justify-content-between align-items-center mb-3">
//         <Link to="/Home" className="text-dark text-decoration-none">
//           <h2><b>Need</b></h2>
//         </Link>
//         <Logout />
//       </div>
//       <ul className="sidebar-menu list-unstyled p-0">
//         {menuItems.map((item, index) => (
//           <li key={index} className="sidebar-menu-item mb-2">
//             {item.link ? (
//               <Link to={item.link} className="sidebar-menu-link d-flex align-items-center text-decoration-none text-dark">
//                 <span className="sidebar-menu-icon me-2">{item.icon}</span>
//                 <span className="sidebar-menu-text">
//                   {item.name}
//                   {item.name === 'Notifications' && newMessageCount > 0 && (
//                     <span className="badge bg-danger ms-2">{newMessageCount}</span>
//                   )}
//                 </span>
//               </Link>
//             ) : (
//               <div className="sidebar-menu-link d-flex align-items-center text-dark" onClick={item.action}>
//                 <span className="sidebar-menu-icon me-2">{item.icon}</span>
//                 <span className="sidebar-menu-text">
//                   {item.name}
//                   {item.name === 'Notifications' && newMessageCount > 0 && (
//                     <span className="badge bg-danger ms-2">{newMessageCount}</span>
//                   )}
//                 </span>
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>
//       <Modal show={showModal} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Create Post</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <UploadPost onSuccess={handleUploadSuccess} />
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };
// export default Sidebar;
///here main shekar
// import React, { useState, useEffect } from 'react';
// import { Link,useNavigate } from 'react-router-dom';
// import Modal from 'react-bootstrap/Modal';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faHome, faSearch, faEnvelope, 
//   faBell, faPlusSquare, faUser 
// } from '@fortawesome/free-solid-svg-icons';
// import './Sidebar.css';
// import UploadPost from './UploadPost';
// import Logout from './Logout';
// import io from 'socket.io-client';
// import axiosInstance from './Interceptors/axiosInterceptor';
// import NotificationList from './NotificationList';
// const socket = io('http://localhost:8001', {
//   transports: ['websocket'],
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
// }); // Adjust the URL to your server
// const Sidebar = ({ users, onMenuClick }) => {
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);
//   const [notificationsList, setNotificationsList] = useState([]);
//   const [unreadMessages, setUnreadMessages] = useState({});
//   const [showNotificationsModal, setShowNotificationsModal] = useState(false);
//   const handleNotificationClick = (notification) => {
//     // Assuming each notification has a `userId` field
//     const userId = notification.userId;
//     if (userId) {
//       console.log(`Navigating to profile with userId: ${userId}`);
//       markAsRead(notification._id);
//       navigate(`/profile/${userId}`);
//       setShowNotificationsModal(false);
//     } else {
//       console.error('No userId in notification');
//     }
//   };
//   const handleNewMessage = (senderId) => {
//     setUnreadMessages((prevState) => ({
//       ...prevState,
//       [senderId]: (prevState[senderId] || 0) + 1,
//     }));
//   };
//   const handleClose = () => setShowModal(false);
//   const handleShow = () => setShowModal(true);
//   const handleUploadSuccess = () => {
//     setShowModal(false);
//     alert("Post successfully uploaded!");
//   };
//   useEffect(() => {
//     // Fetch notifications from API
//     const fetchNotifications = async () => {
//       try {
//         const response = await axiosInstance.get('/notifications', {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
//         console.log(response.data); // Check if the data is coming correctly
//         setNotificationsList(response.data);
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     };
//     fetchNotifications();
//     socket.on('message', (message) => {
//       handleNewMessage(message.senderId);  // Update unread message count
//       setNotificationsList((prevNotifications) => [message, ...prevNotifications]);
//     });
//     socket.on('like', (like) => {
//       setNotificationsList((prevNotifications) => [like, ...prevNotifications]);
//     });
//     socket.on('comment', (comment) => {
//       setNotificationsList((prevNotifications) => [comment, ...prevNotifications]);
//     });
//     socket.on('notification', (notification) => {
//       console.log('Notification received:', notification);
//       setNotificationsList((prevNotifications) => [notification, ...prevNotifications]);
//     });
//     // Cleanup on unmount
//     return () => {
//       socket.off('message');
//       socket.off('like');
//       socket.off('comment');
//       socket.off('notification');
//     };
//   }, []);
//   const markAsRead = async (notificationId) => {
//     try {
//       await axiosInstance.put(`/notifications/${notificationId}/read`);
//       setNotificationsList((prevNotifications) => 
//         prevNotifications.map(n => 
//           n._id === notificationId ? { ...n, read: true } : n
//         )
//       );
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };
//   const unreadNotificationCount = notificationsList.filter(n => !n.read).length;
//   const menuItems = [
//     { name: 'Home', icon: <FontAwesomeIcon icon={faHome} />, action: () => onMenuClick('Post') },
//     { name: 'Search', icon: <FontAwesomeIcon icon={faSearch} />, action: () => onMenuClick('Search') },
//     { name: 'Messages', icon: <FontAwesomeIcon icon={faEnvelope} />, action: () => onMenuClick('Messages') },
//     { name: 'Notifications', icon: <FontAwesomeIcon icon={faBell} />, action: () => setShowNotificationsModal(true) },
//     { name: 'Create', icon: <FontAwesomeIcon icon={faPlusSquare} />, action: handleShow },
//     { name: 'Profile', icon: <FontAwesomeIcon icon={faUser} />, action: () => onMenuClick('Profile') },
//   ];
//   return (
//     <div className="sidebar d-flex flex-column vh-100 p-3">
//       <div className="sidebar-header d-flex justify-content-between align-items-center mb-3">
//         <Link to="/Home" className="text-dark text-decoration-none">
//           <h2><b>Need</b></h2>
//         </Link>
//         <Logout />
//       </div>
//       <ul className="sidebar-menu list-unstyled p-0">
//         {menuItems.map((item, index) => (
//           <li key={index} className="sidebar-menu-item mb-2">
//             <div className="sidebar-menu-link d-flex align-items-center text-dark" onClick={item.action}>
//               <span className="sidebar-menu-icon me-2">{item.icon}</span>
//               <span className="sidebar-menu-text">
//                 {item.name}
//                 {item.name === 'Notifications' && unreadNotificationCount > 0 && (
//                   <span className="badge bg-danger ms-2">{unreadNotificationCount}</span>
//                 )}
//               </span>
//             </div>
//           </li>
//         ))}
//       </ul>
//       <Modal show={showModal} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Create Post</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <UploadPost onSuccess={handleUploadSuccess} />
//         </Modal.Body>
//       </Modal>
//       <Modal show={showNotificationsModal} onHide={() => setShowNotificationsModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Notifications</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {/* <ul>
//             {notificationsList.map((notification) => (
//               <li key={notification._id} onClick={() => markAsRead(notification._id)}>
//                 {notification.content} {!notification.read && <span className="badge bg-primary ms-2">New</span>}
//               </li>
//             ))}
//           </ul> */}
//            <ul>
//             {notificationsList.map((notification) => (
//               <li 
//                 key={notification._id} 
//                 onClick={() => handleNotificationClick(notification)} 
//                 style={{ cursor: 'pointer' }}
//               >
//                 {notification.content} {!notification.read && <span className="badge bg-primary ms-2">New</span>}
//               </li>
//             ))}
//           </ul>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };
// export default Sidebar;
"use strict";