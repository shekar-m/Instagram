import React from "react";
import "./ShareModal.css";
import Search from "./Search";
import UserList from "./UserList";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const ShareModal = ({ show, onClose, selectedPost, onSelectUser }) => {
  if (!show) return null;

  const handleUserSelect = (user) => {
    if (!user || !selectedPost) {
      console.error("Invalid user or post. Cannot share.");
      return;
    }

    console.log("user from the sharemodel handleUserSelect method==>", user);
    console.log(
      "user from the sharemodel handleUserSelect method with selectedPost object==>",
      selectedPost
    );
    onSelectUser(user, selectedPost);
    onClose();
  };

  return (
    <div className="modal-overlay bg-white">
      <Modal show={show} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>Share</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Search onSelectUser={handleUserSelect} />
          <UserList onSelectUser={handleUserSelect} className="bg-secondary" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShareModal;
