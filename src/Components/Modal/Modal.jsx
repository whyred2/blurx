import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';
import { X } from 'lucide-react';

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content-upload">
        <button className="modal-close" onClick={onClose}><X /></button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;