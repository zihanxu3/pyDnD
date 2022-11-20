import React from 'react';
import Dialog from '@mui/material/Dialog';
import Form from './Form';

const ModalDialogWidget = ({ open, handleClose }) => {
  return (
    // props received from App.js
    <Dialog open={open} onClose={handleClose}>
      <Form handleClose={handleClose} />
    </Dialog>
  );
};

export default ModalDialogWidget;