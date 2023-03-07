import React from 'react';
import Dialog from '@mui/material/Dialog';
import Form from './Form';

const ModalImageTextWidget = ({ open, handleClose, imageData }) => {
  return (
    // props received from Body.tsx
    <Dialog open={open} onClose={handleClose}>
        <div style={{margin: '50px', justifyContent: 'center', textAlign: 'center'}}>
            <img style={{maxWidth: '200px', height: 'auto'}} src={`data:image/jpeg;base64, ${imageData['image']}`}/>
            <pre>{imageData['text']}</pre>
        </div>
    </Dialog>
  );
};

export default ModalImageTextWidget;