import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faSearch, faCompass, 
  faEnvelope, faBell, 
  faPlusSquare, faUser 
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import UploadPost from './UploadPost';
import Search from './Search'; // Import the Search component

const Sidebar = ({ onMenuClick }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // State to control search display
  const navigate = useNavigate();

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSearch = () => setShowSearch(true); // Handle search display

  const menuItems = [
    { name: 'Home', icon: <FontAwesomeIcon icon={faHome} />, action: () => navigate('/home') },
    { name: 'Search', icon: <FontAwesomeIcon icon={faSearch} />,action: handleSearch },
    { name: 'Explore', icon: <FontAwesomeIcon icon={faCompass} />, link: '/explore' },
    { name: 'Messages', icon: <FontAwesomeIcon icon={faEnvelope} />, action: () => navigate('/messaging') },
    { name: 'Notifications', icon: <FontAwesomeIcon icon={faBell} />, link: '/notifications' },
    { name: 'Create', icon: <FontAwesomeIcon icon={faPlusSquare} />, action: handleShow },
    { name: 'Profile', icon: <FontAwesomeIcon icon={faUser} />, link: '/profile' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/home" className="text-dark text-decoration-none">
          <h2><b>Instagram</b></h2>
        </Link>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index} className="sidebar-menu-item">
            {item.link ? (
              <Link to={item.link} className="sidebar-menu-link text-decoration-none">
                <span className="sidebar-menu-icon text-dark">{item.icon}</span>
                <span className="sidebar-menu-text text-dark">{item.name}</span>
              </Link>
            ) : (
              <div className="sidebar-menu-link text-decoration-none" onClick={item.action}>
                <span className="sidebar-menu-icon text-dark">{item.icon}</span>
                <span className="sidebar-menu-text text-dark">{item.name}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    
      
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UploadPost />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Sidebar;
