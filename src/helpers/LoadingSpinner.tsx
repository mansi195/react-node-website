import React from 'react';
import { Modal } from 'react-bootstrap';
import '../css/Spinner.css';
import Loader from 'react-loader-spinner';

interface LoadingSpinnerProps {
    data: boolean; // Expecting a boolean value for the 'data' prop
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
    const handleClose = () => {
        //do nothing
    }

    return (
        <>
            {props.data ? (
                <Modal show={true} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered id="spinner-modal">
                    <Loader type="ThreeDots" color="#666699" height="100" width="100" />
                </Modal>
            ) : (
                <Loader type="ThreeDots" color="#666699" height="15" width="100" className='' />
            )}
        </>
    );
}

export default LoadingSpinner;
