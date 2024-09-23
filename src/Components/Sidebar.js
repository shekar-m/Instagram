import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Offcanvas, Badge } from "react-bootstrap"; // Import Offcanvas from Bootstrap
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faEnvelope,
  faBell,
  faPlusSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import UploadPost from "./UploadPost";
import Logout from "./Logout";
import socket from "../Socket";
import axiosInstance from "./Interceptors/axiosInterceptor";

const Sidebar = ({ users, onMenuClick }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);

  const handleNotificationClick = (notification) => {
    const userId = notification.userId;
    if (userId) {
      markAsRead(notification._id);
      navigate(`/profile/${userId}`);
      setShowNotificationsModal(false);
    } else {
      console.error("No userId in notification");
    }
  };

  const handleNewMessage = (senderId) => {
    setUnreadMessages((prevState) => ({
      ...prevState,
      [senderId]: (prevState[senderId] || 0) + 1,
    }));
  };

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleUploadSuccess = () => {
    setShowModal(false);
    alert("Post successfully uploaded!");
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setNotificationsList(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    socket.on("message", (message) => {
      handleNewMessage(message.senderId);
      setNotificationsList((prevNotifications) => [
        message,
        ...prevNotifications,
      ]);
    });

    socket.on("like", (like) => {
      setNotificationsList((prevNotifications) => [like, ...prevNotifications]);
    });

    socket.on("comment", (comment) => {
      setNotificationsList((prevNotifications) => [
        comment,
        ...prevNotifications,
      ]);
    });

    socket.on("notification", (notification) => {
      setNotificationsList((prevNotifications) => [
        notification,
        ...prevNotifications,
      ]);
    });

    return () => {
      socket.off("message");
      socket.off("like");
      socket.off("comment");
      socket.off("notification");
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotificationsList((prevNotifications) =>
        prevNotifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadNotificationCount = notificationsList.filter(
    (n) => !n.read
  ).length;

  const menuItems = [
    {
      name: "Home",
      icon: <FontAwesomeIcon icon={faHome} />,
      action: () => onMenuClick("Post"),
    },
    {
      name: "Search",
      icon: <FontAwesomeIcon icon={faSearch} />,
      action: () => onMenuClick("Search"),
    },
    {
      name: "Messages",
      icon: <FontAwesomeIcon icon={faEnvelope} />,
      action: () => onMenuClick("Messages"),
    },
    {
      name: "Notifications",
      icon: <FontAwesomeIcon icon={faBell} />,
      action: () => setShowNotificationsModal(true),
    },
    {
      name: "Create",
      icon: <FontAwesomeIcon icon={faPlusSquare} />,
      action: handleShow,
    },
    {
      name: "Profile",
      icon: <FontAwesomeIcon icon={faUser} />,
      action: () => onMenuClick("Profile"),
    },
  ];

  return (
    <>
      <button
        className="btn btn-primary d-lg-none m-3"
        type="button"
        onClick={toggleOffcanvas}
      >
        Menu
      </button>

      <Offcanvas
        show={showOffcanvas}
        onHide={toggleOffcanvas}
        className="d-lg-none "
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
          <Logout />
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="list-unstyled">
            {menuItems.map((item, index) => (
              <li key={index} className="sidebar-menu-item mb-2">
                <div
                  className="sidebar-menu-link d-flex align-items-center text-dark"
                  onClick={item.action}
                >
                  <span className="sidebar-menu-icon me-2">{item.icon}</span>
                  <span className="sidebar-menu-text">
                    {item.name}
                    {item.name === "Notifications" &&
                      unreadNotificationCount > 0 && (
                        <Badge bg="danger" className="ms-2">
                          {unreadNotificationCount}
                        </Badge>
                      )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Sidebar for larger screens */}
      <div className="sidebar d-none d-lg-flex flex-column vh-100 p-3 bg-body-secondary">
        <div className="sidebar-header d-flex justify-content-between align-items-center mb-3">
          <Link to="/home/post" className="text-dark text-decoration-none">
            <h2>
              <b>Instagram</b>
            </h2>
          </Link>
          <Logout />
        </div>
        <ul className="sidebar-menu list-unstyled p-0">
          {menuItems.map((item, index) => (
            <li key={index} className="sidebar-menu-item mb-2">
              <div
                className="sidebar-menu-link d-flex align-items-center text-dark"
                onClick={item.action}
              >
                <span className="sidebar-menu-icon me-2">{item.icon}</span>
                <span className="sidebar-menu-text">
                  {item.name}
                  {item.name === "Notifications" &&
                    unreadNotificationCount > 0 && (
                      <Badge bg="danger" className="ms-2">
                        {unreadNotificationCount}
                      </Badge>
                    )}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Modal for creating post */}
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <UploadPost onSuccess={handleUploadSuccess} />
          </Modal.Body>
        </Modal>

        {/* Notifications Modal */}
        <Modal
          show={showNotificationsModal}
          onHide={() => setShowNotificationsModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Notifications</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {notificationsList.map((notification) => (
                <li
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: "pointer" }}
                >
                  {notification.content}{" "}
                  {!notification.read && (
                    <Badge bg="primary" className="ms-2">
                      New
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default Sidebar;
