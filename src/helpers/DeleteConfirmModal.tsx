import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import LoadingSpinner from './LoadingSpinner';
import { MdDelete as Delete } from "react-icons/md";
import '../css/DeleteConfirmModal.css';

// Define the type for the props
interface DeleteConfirmModalProps {
    isOpen: boolean;                                // 'isOpen' is a boolean that controls modal visibility
    onClose: () => void;                            // 'onClose' is a function to handle closing the modal
    action: (response: string) => void;             // 'action' is a function that takes a string ('Y' or 'N')
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = (props) => {
    const [Loading, setLoading] = useState(false);

    const removeItem = () => {
        setLoading(true);
        props.action("Y");
    }

    return (
        <Modal show={props.isOpen} onHide={props.onClose} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header className='delete-modal-header' closeButton>
                <Modal.Title className='delete-modal-title'> 
                    {Loading && <LoadingSpinner />}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <Delete className='delete-modal-icon'/>
                    <h5 className='heading'> Are you sure you want to delete this? </h5>
                </div>
                <div className='modal-buttons'>
                    <button type="button" className='btn btn-primary btn-sm' onClick={removeItem}>Ok</button>
                    &nbsp;&nbsp;&nbsp;
                    <button type="button" className='btn btn-secondary btn-sm' onClick={() => props.action("N")}>Cancel</button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default DeleteConfirmModal;
