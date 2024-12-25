import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';

import { api } from '../helpers/config';
import LoadingSpinner from '../helpers/LoadingSpinner';


interface ClientFormData {
    name: string;
    long_name: string;
  }

export default function AddClient(props) {

    const [ClientFormData, setClientFormData] = useState<ClientFormData>({
        name: '',
        long_name: ''
      });

    const [Loading, setLoading] = useState<boolean>(false);
    const [ShowMsg, setShowMsg] = useState<string>('');

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const value = evt.target.value;
        setClientFormData({
          ...ClientFormData,
          [evt.target.name]: value
        });
    };

    const validateInputData = (): boolean => {
        if (ClientFormData.name === '' || ClientFormData.long_name === '') {
          setShowMsg("Please complete all required fields");
          return true;
        }
        return false;
    };

     // Add new client
    const addNewClient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setShowMsg('');
        const error_found = validateInputData();

        if (!error_found) {
            setLoading(true);

            try{

                // body
                const bodyFormData = new FormData();
                bodyFormData.set("body", JSON.stringify(ClientFormData));
                
                await axios.post(api.url + 'api/client/save_data', bodyFormData, {
                    withCredentials: true,
                })
                setShowMsg('Added successfully'); 
                setLoading(false); 
                props.action("Y");
            }
            catch(error){                                                // Set loading to false if there's an error
                console.error(error);
                setShowMsg('Error saving client data:', error);
            }
    };

    return (
        <Modal id='add_layer_modal' show={props.isOpen} onHide={props.onClose} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title> 
                    Add Data
                    <div className='spinner'>
                        {Loading && <LoadingSpinner/>}
                    </div>
                    <span className={ShowMsg.includes('successfully') ? "alert alert-success" : "alert alert-warning"} style={{display: ShowMsg !== '' ? 'inline' : 'none' }}>{ShowMsg}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                 <form>
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="form-group row">
                                <label htmlFor="name" className="col-sm-2 col-form-label" >Client Name *</label>
                                <input type="text" placeholder="Enter name" className="form-control-sm" name="name" value={ClientFormData.name} onChange={handleChange}/>
                                &nbsp; &nbsp; &nbsp;
                                <label htmlFor="long_name" className="col-sm-2 col-form-label" >Long Name *</label>
                                <input type="text" placeholder="Enter long_name" className="form-control-sm" name="long_name" value={ClientFormData.long_name} onChange={handleChange}/>
                            </div>
                        </div>
                    </div>
                </form>
                <button type="submit" className='btn btn-primary btn-sm' id='add_layer_btn' onClick={addNewClient}>Add</button>
            </Modal.Body>
        </Modal>
    )
}