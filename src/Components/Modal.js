import React from 'react';
import './Modal.css';
import { Modal } from 'react-bootstrap';
const Modal= ({ show, onClose, children })  => {
    if (!show) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">
          {children}
          <p>helooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo</p>
        </div>
      </div>
    </div>
    );
}

export default Modal;