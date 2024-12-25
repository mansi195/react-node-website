import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {Tooltip, OverlayTrigger} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Type } from 'react-bootstrap-table2-editor';
import ReactSwitch from 'react-switch';
import { FiDelete as Delete } from "react-icons/fi";

import { UserInfo } from '../index';
import { api } from '../helpers/config';
import LoadingSpinner from '../helpers/LoadingSpinner';
import AddClient  from '../modals/AddClient';
import DeleteConfirmModal  from '../helpers/DeleteConfirmModal';

export default function Client() {

    // Get the role (admin_status) from the UserInfo context
    const role = useContext(UserInfo)['admin_status'];
    
    const [ClientInfo, setClientInfo] = useState([]);
    const [ClientCols, setClientCols] = useState([
        role === 'admin' ? 
        {
            dataField: '', text: 'Action', editable: false,
            formatter: (cell, row) => 
                <>    
                    <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Remove client")}>
                        <Delete className='delete-icon' onClick={() => deleteClient(row.CLIENT_KEY)} />
                    </OverlayTrigger>
                    <span title='Mark client as internal/external' >
                        <ReactSwitch name = 'INTERNAL_CLIENT' checked={row.CLIENT_TYPE == 'INTERNAL' ? true : false} onChange={() => toggleClientRole(row.CLIENT_KEY)}/> 
                    </span> 
                </>
        } 
        : {dataField: '', text: ''},
        {dataField: 'CLIENT_NAME', text: 'Client Name', tabindex:'-1', editable: false},
        {dataField: 'CLIENT_TYPE', text: 'Client Type', editable: false},
        {   dataField: 'CLIENT_GRADE', 
            text: 'Client Grade',  
            editor: {
                type: Type.SELECT,
                options: [
                    { value: '', label: '' }, 
                    { value: '1', label: '1' }, 
                    { value: '2', label: '2' }, 
                    { value: '3', label: '3' }
                ]
            },
        },
        {dataField: 'CURR_TIMESTAMP', text: 'Created Date', editable: false},
        {dataField: 'LAST_MODIFIED_DATE', text: 'Last Modified Date', editable: false}
    ]); 
    const { SearchBar } = Search;
    const [Loading, setLoading] = useState(false);
    const [SelectedRow, setSelectedRow] = useState(-1);
    const [ShowMsg, setShowMsg] = useState('');

    // MODAL
    const [ShowAddModal, setShowAddModal] = useState(false);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    const [ShowModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const paginationOptions = {  
        sizePerPageList: [ 
            { text: '15', value: 15 },
            { text: '30', value: 30 }, 
            { text: 'All', value: ClientInfo.length} 
        ],
    }; 

    const renderTooltip = (string) => {
        return <Tooltip> {string} </Tooltip>
    }

    useEffect(() => {
        getClientInfo();
    }, []);

    const getClientInfo = async () => {
        setLoading(true);

        try {
            const response = await axios.get(api.url + 'api/client/get_data', {
                withCredentials:true,
            })
            setClientInfo(response.data['rows']); 
            setLoading(false); 
        } catch (error) {
            setShowMsg('Error fetching client data:', error);
        }
    }

    // once data is in, check for column rights
    useEffect(() => {
        checkColumns();
    }, [ClientInfo.length > 0 ]);

    const checkColumns = () => {

        if (role == 'admin'){
            setClientCols([
                {dataField: '', text: 'Action', editable: false,
                    formatter: (cell, row) => 
                        <>    
                            <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Remove client")}>
                                <Delete className='delete-icon' onClick={() => deleteClient(row.CLIENT_KEY)} />
                            </OverlayTrigger>
                            <span title='Mark client as internal/external' >
                                <ReactSwitch name = 'INTERNAL_CLIENT' checked={row.CLIENT_TYPE == 'INTERNAL' ? true : false} onChange={() => toggleClientRole(row.CLIENT_KEY)}/> 
                            </span> 
                        </>
                },
                {dataField: 'CLIENT_NAME', text: 'Client Name', tabindex:'-1', editable: false},
                {dataField: 'CLIENT_TYPE', text: 'Client Type', editable: false},
                {   dataField: 'CLIENT_GRADE', 
                    text: 'Client Grade',  
                    editor: {
                        type: Type.SELECT,
                        options: [
                            { value: '', label: '' }, 
                            { value: '1', label: '1' }, 
                            { value: '2', label: '2' }, 
                            { value: '3', label: '3' }
                        ]
                    },
                },
                {dataField: 'CURR_TIMESTAMP', text: 'Created Date', editable: false},
                {dataField: 'LAST_MODIFIED_DATE', text: 'Last Modified Date', editable: false}
            ]) 
        }
        else 
        {
            let temp = ClientCols;
            if(temp[0]['dataField'] === ''){
                temp.shift();
            }
            setClientCols(temp);
        }
    }

    // DELETE CLIENT
    const deleteClient = (client_key) => { 
        handleShowModal();
        setSelectedRow(client_key);
    }
    const deleteClientAction = async (action) => {

        if(action == 'N'){
            handleCloseModal();
        }
        else{
            setLoading(true);
            setShowMsg('');

            try {
                const response = await axios.get(api.url + 'client', {
                    withCredentials:true,
                })
                handleCloseModal(); 
                getClientInfo();
                setLoading(false);
                setSelectedRow(-1);
            } catch (error) {
                setShowMsg('Error deleting client data:', error);
            }
        }
    }

    // MARK CLIENT AS INTERNAL/EXTERNAL
    const toggleClientRole = async (client_key) => {

        setLoading(true);
        setShowMsg('');

        try {
            const response = await axios.get(api.url + 'client', {
                withCredentials:true,
            })
            getClientInfo();
            setLoading(false);
        } catch (error) {
            setShowMsg('Error updating client role:', error);
        }
    }

    // ADD CLIENT
    const addedData = (action) => {
        if(action == 'Y'){
            getClientInfo();
        }
    }

    // EDIT CLIENT GRADE VALUE
    const cellEdit = cellEditFactory({
        mode: 'click',
        blurToSave: true,
        afterSaveCell: async (oldValue, newValue, row, column) => { 

            try {
                const response = await axios.get(api.url + 'client', {
                    withCredentials:true,
                })
                row.CLIENT_GRADE = newValue; 
                getClientInfo();
                setLoading(false);
            } catch (error) {
                setShowMsg('Error updating client grade:', error);
            }

        }
    });


    return (
        <>
            { ShowAddModal && <AddClient isOpen={ShowAddModal} onClose={handleCloseAddModal} action={addedData} /> }
            { ShowModal && SelectedRow !== -1 && <DeleteConfirmModal isOpen={ShowModal} action={deleteClientAction} onClose={handleCloseModal} /> }
            <form id="main-form">
                { Loading && <LoadingSpinner /> }
                <div className="lsp_msg">
                    <span className={ShowMsg.includes('successfully') ? "alert alert-success" : "alert alert-warning"} style={{display: ShowMsg !== '' ? 'inline' : 'none' }}>{ShowMsg}</span>
                </div> 
            </form>
            {role === 'admin' && 
                <form id="sub_form">
                    <div className="col-12">
                        <div className="form-group row">
                            <div className="col-sm-2">
                                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Add new Client")}>
                                    <button type="button" className='btn btn-primary btn-sm' onClick={handleShowAddModal} id='add_data'>Add</button>
                                </OverlayTrigger>
                            </div>
                        </div>
                    </div>
                </form>
                
            }


            {ClientInfo.length > 0 && 
                <ToolkitProvider keyField="CLIENT_KEY" data={ ClientInfo } columns={ ClientCols }  search>
                    {props => (
                        <div id="technology_table">
                            <div className="form-group row">
                                <div className="col-sm-8">  
                                    <SearchBar { ...props.searchProps } />
                                    {role == 'CE-RoleMgmt' ?
                                        <BootstrapTable { ...props.baseProps } pagination={ paginationFactory(paginationOptions) } cellEdit={cellEdit} striped /> : 
                                        <BootstrapTable { ...props.baseProps } pagination={ paginationFactory(paginationOptions) } striped />
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </ToolkitProvider>
            }
        </>
    )
}