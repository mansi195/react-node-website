import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { useDebouncedCallback } from 'use-debounce';
import InfiniteScroll from 'react-infinite-scroll-component';

import { UserInfo } from '../index';
import '../css/DisplayAllProjects.css';
import { api } from '../helpers/config';
import LoadingSpinner from '../helpers/LoadingSpinner';
// import DeleteConfirmModal  from '../helpers/DeleteConfirmModal';

// Define types for the state variables
interface SearchValueType {
    s_key: string;
    s_project_name: string;
    s_revision: string;
    s_status: string;
    s_version: string;
    s_technology: string;
    s_client: string;
    s_details: string;
    s_project_layout: string;
    s_creator: string;
    s_timestamp: string;
}

interface DisplayFormDataType {
    completed: boolean;
    in_progress: boolean;
    in_approval: boolean;
    cancelled: boolean;
}


export default function DisplayAllProjects() {
    
    // Get the role (admin_status) from the UserInfo context
    const role = useContext(UserInfo)['admin_status'];

    const [DisplayFormData, setDisplayFormData] = useState<DisplayFormDataType>({
        completed: true,
        in_progress: true,
        in_approval: true,
        cancelled: false, 
    });

    // PROJECT DATA
    const [AllProjectsData, setAllProjectsData] = useState<any[]>([]);
    const [DisplayProjectData, setDisplayProjectData] = useState<any[]>([]);
 
    // SEARCH
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [offset, setOffset] = useState<number>(0);
    const [UserFiltering, setUserFiltering] = useState<boolean>(false);
    const [SearchValue, setSearchValue] = useState<SearchValueType>({
        s_key: '',
        s_project_name: '',
        s_revision: '',
        s_status: '',
        s_version: '',
        s_technology: '',
        s_client: '',
        s_details: '',
        s_project_layout: '',
        s_creator: '',
        s_timestamp: ''
    });
    const [DebouncedValue, setDebouncedValue] = useState<SearchValueType>(SearchValue);
    
    // MISC
    const [ShowMsg, setShowMsg] = useState<string>('');
    const [Loading, setLoading] = useState<boolean>(false);
    const [SelectedRow, setSelectedRow] = useState<number>(-1);

    // MODAL
    const [ShowModal, setShowModal] = useState<boolean>(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const renderTooltip = (string: string) => {
        return <Tooltip>{string}</Tooltip>;
    };

    // FORM HANDLE CHANGE
    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if (evt.target.type === "checkbox") {
            const value = evt.target.checked;
            setDisplayFormData({
                ...DisplayFormData,
                [evt.target.name]: value
            });
        }
    };

    /* --------------------- GET ALL DATA -------------------------- */
    
    useEffect(() => {
        getAllData();
    }, []);

    const getAllData = async () => {
        setLoading(true);
        setShowMsg("");

        try {
            const response = await axios.get(api.url + 'api/projects/get_data', {
                withCredentials: true,
            });
            setAllProjectsData(response.data.rows || []);
        } catch (error) {
            setShowMsg('Error fetching setup data:', error);
        }
    }


    /* --------------------- SEARCHING FIELDS ------------------------ */
    const search = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setSearchValue({
            ...SearchValue,
            [event.target.name]: value
        });
    }


    // Debounce callback
    const debounced = useDebouncedCallback(
        
        // function, do something, e.g. set a other State
        (value: SearchValueType) => {
            setDebouncedValue(value);
        },
        // delay in ms
        500
    );

    // every time inputState changes
    useEffect(() => {
        debounced.callback(SearchValue);
    }, [SearchValue]);

    
    /* ---------------------------- INFINITE SCROLL ----------------------------- */
    // load data into list on Mount
    // useEffect(() => { 
    //     console.log("Load first 50");
    //     loadMoreData(50);
    // }, [AllProjectsData.length > 0]);


    const loadMoreData = (limit: number) => {

        // SEARCH BY COLUMN FIELDS
        let searchedData = AllProjectsData.filter( (item) =>
            (item.KEY.toLowerCase().indexOf(DebouncedValue['s_key'].toLowerCase()) !== -1 ) &&
            (item.NAME.toLowerCase().indexOf(DebouncedValue['s_project_name'].toLowerCase()) !== -1 ) &&
            (item.REVISION.toLowerCase().indexOf(DebouncedValue['s_revision'].toLowerCase()) !== -1 ) &&  
            (item.STATUS.toLowerCase().indexOf(DebouncedValue['s_status'].toLowerCase()) !== -1 ) &&
            (item.TECHNOLOGY.toLowerCase().indexOf(DebouncedValue['s_technology'].toLowerCase()) !== -1 ) &&
            (item.CLIENT.toLowerCase().indexOf(DebouncedValue['s_client'].toLowerCase()) !== -1 ) &&
            (item.DETAILS.toLowerCase().indexOf(DebouncedValue['s_details'].toLowerCase()) !== -1 ) && 
            (item.PROJECT_LAYOUT.toLowerCase().indexOf(DebouncedValue['s_project_layout'].toLowerCase()) !== -1 ) && 
            (item.CREATOR.toLowerCase().indexOf(DebouncedValue['s_creator'].toLowerCase()) !== -1 )  &&
            (item.CURR_TIMESTAMP.toLowerCase().indexOf(DebouncedValue['s_timestamp'].toLowerCase()) !== -1 )  
        )
        
        // FILTER DATA BY STATUS
        if( (DisplayFormData.completed === true || DisplayFormData.in_progress === true || DisplayFormData.in_approval === true || DisplayFormData.cancelled === true) ){
           
            searchedData = searchedData.filter(data => {

                if( (DisplayFormData.completed === true && DisplayFormData.in_progress === true && DisplayFormData.in_approval === true && DisplayFormData.cancelled === true) ){
                    return data;
                }
                // Latest
                else if( (DisplayFormData.completed === true && DisplayFormData.in_progress === false && DisplayFormData.in_approval === false && DisplayFormData.cancelled === false) && data['STATUS'] === 'COMPLETED' ){
                    return data;
                } 
                // Latest and In Progress
                else if( (DisplayFormData.completed === true && DisplayFormData.in_progress === true && DisplayFormData.in_approval === false && DisplayFormData.cancelled === false) && data['STATUS'] !== 'CANCELLED' && data['STATUS'] !== 'IN_APPROVAL'){
                    return data;
                }
                // Latest and In Approval
                else if( (DisplayFormData.completed === true && DisplayFormData.in_progress === false && DisplayFormData.in_approval === true && DisplayFormData.cancelled === false) && data['STATUS'] !== 'CANCELLED' && data['STATUS'] !== 'IN_PROGRESS'){
                    return data;
                }
                // Latest and Cancelled
                else if( (DisplayFormData.completed === true && DisplayFormData.in_progress === false && DisplayFormData.in_approval === false && DisplayFormData.cancelled === true) && data['STATUS'] !== 'IN_APPROVAL' && data['STATUS'] !== 'IN_PROGRESS'){
                    return data;
                }
                // Latest and In Progress and In Approval
                else if( (DisplayFormData.completed === true && DisplayFormData.in_progress === true && DisplayFormData.in_approval === true && DisplayFormData.cancelled === false) && data['STATUS'] !== 'CANCELLED'){
                    return data;
                }
                // Latest and In Progress and Cancelled
                else if( ( DisplayFormData.completed === true && DisplayFormData.in_approval === false && DisplayFormData.in_progress === true && DisplayFormData.cancelled === true ) && data['STATUS'] !== 'IN_APPROVAL'){
                    return data;
                }
                // Latest and In Approval and Cancelled
                else if( ( DisplayFormData.completed === true && DisplayFormData.in_approval === true && DisplayFormData.in_progress === false && DisplayFormData.cancelled === true ) && data['STATUS'] !== 'IN_PROGRESS'){
                    return data;
                }
                // In Progress
                else if( ( DisplayFormData.completed === false && DisplayFormData.in_approval === false && DisplayFormData.in_progress === true && DisplayFormData.cancelled === false ) && data['STATUS'] === 'IN_PROGRESS'){
                    return data;
                }
                // In Progress and In Approval
                else if( ( DisplayFormData.completed === false && DisplayFormData.cancelled === false && DisplayFormData.in_approval === true && DisplayFormData.in_progress === true ) && data['STATUS'] !== 'CANCELLED' && data['STATUS'] !== 'COMPLETED'){
                    return data;
                }
                // In Progress and Cancelled
                else if( ( DisplayFormData.in_progress === true && DisplayFormData.in_approval === false && DisplayFormData.cancelled === true && DisplayFormData.completed === false) && data['STATUS'] !== 'IN_APPROVAL' && data['STATUS'] !== 'COMPLETED'){
                    return data;
                }
                // In Progress and In Approval and Cancelled
                else if( (DisplayFormData.in_progress === true && DisplayFormData.in_approval === true && DisplayFormData.completed === false && DisplayFormData.cancelled === true) && data['STATUS'] !== 'COMPLETED'){
                    return data;
                }
                // In Approval
                else if( (DisplayFormData.in_progress === false && DisplayFormData.in_approval === true && DisplayFormData.completed === false && DisplayFormData.cancelled === false) && data['STATUS'] === 'IN_APPROVAL'){
                    return data;
                }
                // In Approval and Cancelled
                else if( (DisplayFormData.in_progress === false && DisplayFormData.cancelled === true && DisplayFormData.in_approval === true && DisplayFormData.completed === false) && data['STATUS'] !== 'IN_PROGRESS' && data['STATUS'] !== 'COMPLETED' ){
                    return data;
                }
                // Cancelled
                else if( (DisplayFormData.in_approval === false && DisplayFormData.cancelled === true && DisplayFormData.in_progress === false && DisplayFormData.completed === false) && data['STATUS'] === "CANCELLED" ){
                    return data;
                }
            })
        }
 
        // NO STATUS SELECTED -> ALL DATA WILL BE GONE
        if(DisplayFormData.completed === false && DisplayFormData.in_progress === false && DisplayFormData.in_approval === false && DisplayFormData.cancelled === false){
            searchedData = [];
        } 

        let res = searchedData.slice(offset, offset+limit);
   
        if(res.length > 0) {                                                                                 // if we have results, add them to the DisplayProjectData and update the offset
            setDisplayProjectData( DisplayProjectData.concat(res) )
            setOffset(offset + limit);
            setHasMore(true);
        } 
        else {                                                                                              // else we have nothing else to load                               
            setHasMore(false);
        }
        setUserFiltering(false);
    }

    useEffect(() => {
        setUserFiltering(true);
    }, [DebouncedValue, DisplayFormData]);

    useEffect(() => {
        if(UserFiltering == true ){
            setDisplayProjectData([]);
            setOffset(0);
        }
    }, [UserFiltering]);

    useEffect(() => {
        if(DisplayProjectData.length == 0 && offset == 0){
            loadMoreData(50);
        }
    }, [DisplayProjectData]);


    return (
        <>
        
            <form id="main-form">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="form-group row">
                            { Loading && <LoadingSpinner /> }
                            <div className="col-sm-8">
                                <span className={ShowMsg.includes('successfully') ? "alert alert-success" : "alert alert-warning"} style={{display: ShowMsg !== '' ? 'inline' : 'none' }}>{ShowMsg}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            
            <form id="display_checkbox">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="form-group row">
                            <div className="col-sm-4">
                                <div className="form-check form-check-inline">
                                    <input type="checkbox" className="form-check-input" name="completed" checked={DisplayFormData.completed || false} onChange={handleChange} />
                                    <label htmlFor="completed" className="form-check-label">Latest</label>
                                    &nbsp; &nbsp; &nbsp;
                                    <input type="checkbox" className="form-check-input" name="in_progress" checked={DisplayFormData.in_progress || false} onChange={handleChange} />
                                    <label htmlFor="in_progress" className="form-check-label" >In Progress</label>
                                    &nbsp; &nbsp; &nbsp;
                                    <input type="checkbox" className="form-check-input" name="in_approval" checked={DisplayFormData.in_approval || false} onChange={handleChange} />
                                    <label htmlFor="in_approval" className="form-check-label" >In Approval</label>
                                    &nbsp; &nbsp; &nbsp;
                                    <input type="checkbox" className="form-check-input" name="cancelled" checked={DisplayFormData.cancelled || false} onChange={handleChange} />
                                    <label htmlFor="cancelled" className="form-check-label" >Cancelled</label>
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>
            </form>

            {AllProjectsData.length > 0 &&
                <>
                    <table className="table all_projects">
                        <thead>
                            <tr>
                                {role === 'admin' && <th scope="col" className='action'>ACTION</th> }
                                <th scope="col" >KEY</th>
                                <th scope="col" >PROJECT NAME</th>
                                <th scope="col" >VERSION</th>
                                <th scope="col" >TECHNOLOGY</th>
                                <th scope="col" >CLIENT</th>
                                <th scope="col" >DETIALS</th>
                                <th scope="col" >PROJECT LAYOUT</th>
                                <th scope="col" >CREATOR</th>
                                <th scope="col" >TIMESTAMP</th>
                            </tr>
                            <tr>
                                {role === 'admin' && <th scope="col"></th> }
                                <th scope="col"></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_key' value={SearchValue['s_key'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_project_name' value={SearchValue['s_project_name'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_version' value={SearchValue['s_version'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_technology' value={SearchValue['s_technology'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_client' value={SearchValue['s_client'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_details' value={SearchValue['s_details'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_project_layout' value={SearchValue['s_project_layout'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_creator' value={SearchValue['s_creator'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_timestamp' value={SearchValue['s_timestamp'] || ''} onChange={(event) => search(event)} className="form-control-search " /></th>
                            </tr>
                        </thead>
                    </table>

                    <InfiniteScroll 
                        className='all_projects'
                        height = {600}
                        dataLength={DisplayProjectData.length}
                        next={() => { loadMoreData(20)}}
                        hasMore={hasMore}
                    >
                        <table className="table table-striped table-responsive">
                            <tbody>
                                {DisplayProjectData.map( (item, i) => 
                                    <tr key={i}>
                                        {role === 'admin' && 
                                            <td className='action'>
                                                {item.STATUS == "COMPLETED" && 
                                                    // admin actions
                                                    <></>
                                                }
                                                {item.STATUS == "IN_PROGRESS" && 
                                                    // admin actions
                                                    <></>
                                                }
                                            </td>
                                        }
                                        <td className='status'>
                                            <div className={'d-flex justify-content-xl-center '+ (item.FLAG == 'R' ? 'progress_status' : (item.FLAG == 'Y' ? 'complete_status': (item.FLAG == 'A' ? 'pending_status': (item.FLAG == 'N' ? 'obsolete_status': '') ) ) )}>
                                                {item.STATUS}
                                            </div>
                                        </td>
                                        <td className='key'>{item.KEY}</td>
                                        <td className='project_name links'>{item.NAME}</td>
                                        <td className='maskset links'>{item.VERSION}</td>
                                        <td >{item.TECHNOLOGY}</td>
                                        <td >{item.CLIENT}</td>
                                        <td >{item.DETAILS}</td>
                                        <td >{item.PROJECT_LAYOUT}</td>
                                        <td >{item.CREATOR}</td>
                                        <td >{item.CURR_TIMESTAMP}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </InfiniteScroll>
                </>
            }   
        </>
    )
}