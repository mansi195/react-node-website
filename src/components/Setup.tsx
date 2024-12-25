import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CSVReader } from 'react-papaparse';
import { Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import { FiDelete as Delete, FiDownload as Download, FiEdit as Edit } from 'react-icons/fi';


import { api } from '../helpers/config';
import { UserInfo } from '../index';
import LoadingSpinner from '../helpers/LoadingSpinner';
import DeleteConfirmModal from '../helpers/DeleteConfirmModal';
import RankingTableModal from '../modals/RankingTableModal';
import '../css/Setup.css';


// Define the structure for the search values used in state
interface SearchValue {
    s_client_name: string;
    s_workshop: string;
    s_tech: string;
    s_equipment: string;
    s_film_type: string;
    s_machine_category: string;
    s_mask_category: string;
    s_quality: string;
    s_code_identifier: string;
    s_film_component: string;
}

interface ItemDetails {
    ClientName: string;         
    Workshop: string;    
    Equipment: string;       
    Tech: string;   
    FilmType: string;            
    MachineCategory: string;     
    MaskCategory: string;        
    Quality: string;      
    CodeIdentifier: string;      
    FilmComponent: string;      
}



export default function Setup() {
    
    // Get the role (admin_status) from the UserInfo context
    const role = useContext(UserInfo)['admin_status'];

    const [SetupData, setSetupData] = useState<any[]>([]);        // Assuming SetupData can be any structure

    // Search filter state with all fields being strings
    const [SearchValue, setSearchValue] = useState<SearchValue>({
        s_client_name: '',
        s_workshop: '',
        s_tech: '',
        s_equipment: '',
        s_film_type: '',
        s_machine_category: '',
        s_mask_category: '',
        s_quality: '',
        s_code_identifier: '',
        s_film_component: ''
    });

    const renderTooltip = (string) => {
        return <Tooltip> {string} </Tooltip>
    }

    // Loading state to indicate whether the data is being fetched
    const [Loading, setLoading] = useState<boolean>(false);

    // Default to -1 to indicate no row selected
    const [SelectedRow, setSelectedRow] = useState<number>(-1); 

    // Modal management states
    const [ShowModal, setShowModal] = useState<boolean>(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    // Modal for adding new Setup
    const [ShowAddModal, setShowAddModal] = useState<boolean>(false);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    // Modal for editing an existing  Setup
    const [ShowEditModal, setShowEditModal] = useState<boolean>(false);
    const handleCloseEditModal = () => setShowEditModal(false);
    const handleShowEditModal = () => setShowEditModal(true);

    // Modal for ranking
    const [ShowRankModal, setShowRankModal] = useState<boolean>(false);
    const handleCloseRankModal = () => setShowRankModal(false);
    const handleShowRankModal = () => setShowRankModal(true);

    // State for handling CSV file data
    const [CSVFileData, setCSVFileData] = useState<any[]>([]);                         // Assuming CSVFileData is an array of any objects

    // State for showing file read messages
    const [FileReadMsg, setFileReadMsg] = useState<any[]>([]); 



    useEffect(() => {
        getSetupData();
    }, []);


    const getSetupData = async () => {
        try {
            const response = await axios.get(api.url + 'api/setup/get_data', {
                withCredentials: true,
            });
            setSetupData(response.data.rows || []);
        } catch (error) {
            console.error('Error fetching setup data:', error);
        }
    }

    // Handle changes in the search filter fields
    const search = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setSearchValue({
            ...SearchValue,
            [event.target.name]: value,                                 // Dynamically update the search field
        });
    };

    // Filter SetupData based on SearchValue
    let filteredData = SetupData.filter((item) => 
        
        // Filter logic for each field in SearchValue
        (item.ClientName.toLowerCase().includes(SearchValue.s_client_name.toLowerCase()) || item.ClientName.toLowerCase().includes('any')) &&
        (item.Workshop.toLowerCase().includes(SearchValue.s_workshop.toLowerCase()) || item.Workshop.toLowerCase().includes('any')) &&
        (item.Tech.toLowerCase().includes(SearchValue.s_tech.toLowerCase()) || item.Tech.toLowerCase().includes('any')) &&
        (item.Equipment.toLowerCase().includes(SearchValue.s_equipment.toLowerCase()) || item.Equipment.toLowerCase().includes('any')) &&
        (item.FilmType.toLowerCase().includes(SearchValue.s_film_type.toLowerCase()) || item.FilmType.toLowerCase().includes('any')) &&
        (item.MachineCategory.toLowerCase().includes(SearchValue.s_machine_category.toLowerCase()) || item.MachineCategory.toLowerCase().includes('any')) &&
        (item.MaskCategory.toLowerCase().includes(SearchValue.s_mask_category.toLowerCase()) || item.MaskCategory.toLowerCase().includes('any')) &&
        (item.Quality.toLowerCase().includes(SearchValue.s_quality.toLowerCase()) || item.Quality.toLowerCase().includes('any')) &&
        (item.CodeIdentifier.toLowerCase().includes(SearchValue.s_code_identifier.toLowerCase()) || item.CodeIdentifier.toLowerCase().includes('any')) &&
        (item.FilmComponent.toLowerCase().includes(SearchValue.s_film_component.toLowerCase()) || item.FilmComponent.toLowerCase().includes('any')) &&
    );

    // Delete a selected row by showing the delete modal
    const deleteRow = (index: number) => {
        setSelectedRow(index);                                              // Set the selected row index
        handleShowModal();                                                  // Show the delete confirmation modal
    };

    // Function to delete Setup data
    const deleteSetup = async (action: string) => {

        // Perform deletion if 'Y' is passed and SelectedRow is valid
        if (action === 'Y' && SelectedRow !== -1) {

            try {
                await axios.get(api.url + 'api/setup/delete_data', {
                    withCredentials: true,
                    params: {
                        'key': SelectedRow
                    }
                });
                handleCloseModal();                                 // Close the delete modal
                getSetupData();                                     // Refresh data after deletion
            } catch (error) {
                console.error('Error deleting setup:', error);
            }
        } else {
            handleCloseModal();                                     // Close the modal if 'N' or invalid row
            setSelectedRow(-1);                                     // Reset the selected row
        }
    };

    // Handle added data and refresh
    const addedData = async (action: string) => {
        if (action === 'Y') {
            await getSetupData();                                   // Refresh data after addition
        }
        setSelectedRow(-1);                                         // Reset the selected row
    };

    // Edit selected row
    const editRow = (index: number) => {
        setSelectedRow(index);                                      // Set the selected row index
        handleShowEditModal();                                      // Show the edit modal
    };

    // Function to handle editing data
    const editData = async (action: string) => {
        if (action === 'Y') {
            await getSetupData();                               // Refresh data after editing
        }
        handleCloseEditModal();                                 // Close the edit modal
        setSelectedRow(-1);                                     // Reset the selected row
    };


    // CSV export function
    const exportCSV = (): void => {
        // Create the CSV header
        let output = '"Client Name","Workshop","Equipment Type","Tech","Film Type","Machine Category","Mask Category","Quality","Code Identifier","Film Component"\n';
        
        // Create a hidden anchor element to trigger CSV download
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(output);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'SetupTemplate.csv';
        hiddenElement.click();
    };

    // Helper function to validate values against lists and return proper values or errors
    const validateField = ( field: string, searchList: ListData[], columnName: string, rowIndex: number, errorList: string[] ): string => {
        let validValue = '';
        if (field === '' || field.toLowerCase().includes('any')) {
            validValue = 'ANYVALUE';
        } else {
            const match = searchList.find(item => item[columnName] === field.trim());
            if (match) {
                validValue = field.trim();
            } else {
                errorList.push(`At row: ${rowIndex + 2} received invalid ${columnName} value`);
            }
        }
        return validValue;
    };

    // Handle file drop
    const handleOnDrop = (data: any[]): void => {
        // Remove header row
        data.shift();

        // Map data to relevant columns, remove empty rows
        let outputData = data.map((obj: any) => obj["data"]).filter((row: any) => row.length > 1);

        // Initialize error and result arrays
        let error: string[] = [];
        let result: string[][] = [];

        // Process each row
        outputData.forEach((row, index) => {
            let client_name = validateField(row[0], [], 'ClientName', index, error);
            let workshop = validateField(row[1], [], 'Workshop', index, error);
            let equipment_type = validateField(row[2], [], 'EquipmentType', index, error);
            let tech = validateField(row[3], [], 'Tech', index, error);
            let film_type = validateField(row[4], [], 'FilmType', index, error);
            let machine_category = validateField(row[5], [], 'MachineCategory', index, error);
            let mask_category = validateField(row[6], [], 'MaskCategory', index, error);
            let quality = validateField(row[7], [], 'Quality', index, error);
            let code_identifier = validateField(row[8], [], 'CodeIdentifier', index, error);
            let film_component = validateField(row[9], [], 'FilmComponent', index, error);

            // If there are errors, skip processing this row
            if (error.length === 0) {
                result.push([client_name, workshop, equipment_type, tech, film_type, machine_category, quality, code_identifier, film_component]);
            }
        });

        // Update file read messages and CSV data
        if (error.length > 0) {
            setFileReadMsg(error);
        } else {
            setFileReadMsg([]);
            setCSVFileData(result);
        }
    };

    // Error handling for file drop
    const handleOnError = (err: Error, file: File, inputElem: HTMLInputElement, reason: string): void => {
        console.error("File Error:", err);
        console.error("File:", file.name);
        console.error("Reason:", reason);
    };

    // Remove file data after removal
    const handleOnRemoveFile = (): void => {
        setCSVFileData([]);
        setFileReadMsg([]);
    };


    // Function to add setup data from the CSV
    const addSetupDataFromCSV = async (e: React.FormEvent) => {
        e.preventDefault();
        setFileReadMsg([]);                                                     // Clear any previous error messages
        setLoading(true);                                                       // Set loading state to true

        // body
        const bodyFormData = new FormData();
        bodyFormData.set("body", JSON.stringify(CSVFileData));

        try{
            await axios.post(api.url + 'api/setup/add_setup_data_from_csv', bodyFormData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            setLoading(false);                                                  // Set loading to false after response
            getSetupData();                                                     // Fetch the updated data
        }
        catch(error){
            setLoading(false);                                                  // Set loading to false if there's an error
            console.error(error);
            setFileReadMsg([{ message: "An error occurred while uploading the data." }]);
        }
    };

    // Function to download the setup data as a CSV
    const downloadCompleteSetupData = (): void => {
        let output = '"Client Name","Workshop","Equipment Type","Tech","Film Type","Machine Category","Mask Category","Quality","Code Identifier","Film Component"\n';
        
        SetupData.forEach((record) => {
            output += `"${record.ClientName}","${record.Workshop}","${record.Equipment}","${record.Tech}","${record.FilmType}","${record.MachineCategory}","${record.MaskCategory}","${record.Quality}","${record.CodeIdentifier}","${record.FilmComponent}","${record.CREATOR_COMMENT}","${record.CREATOR}","${record.CREATED_TIMESTAMP}"\n`;
        });

        const hiddenElement = document.createElement("a");
        hiddenElement.href = "data:attachment/text," + encodeURIComponent(output);
        hiddenElement.target = "_blank";
        hiddenElement.download = "SetupData.csv";
        hiddenElement.click();
    };

    const popover = (
        <Popover id="popover-basic">
            <Popover.Title as="h5">Errors</Popover.Title>
            <Popover.Content>
                <div className="input-group">
                    <textarea
                        className="text-truncate"
                        type="text"
                        rows={5}
                        cols={45}
                        spellCheck={false}
                        data-gramm_editor="false"
                        value={FileReadMsg.map((msg) => msg.message).join("\n")}
                    readOnly                                                        // To make the textarea non-editable (optional)
                    />
                </div>
            </Popover.Content>
        </Popover>
    );

    return (
        <>
            { ShowModal && <DeleteConfirmModal isOpen={ShowModal} action={deleteSetup} onClose={handleCloseModal} /> }
            { ShowRankModal && <RankingTableModal isOpen={ShowRankModal} onClose={handleCloseRankModal}  /> }
            
            { Loading && <LoadingSpinner /> }

            <form id="sub_form">
                <div className="col-12">
                    <div className="form-group row">
                        <div className="col-sm-2 film_btn">
                            <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Download complete data")}>
                                <button type="button" className='btn btn-secondary btn-sm'  onClick={downloadCompleteSetupData}>Download</button>
                            </OverlayTrigger>
                        </div>
                        {role === 'admin' ?
                            <div className="col-sm-8">
                                <div className="form-group row">
                                    <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Download template")}>
                                        <Download onClick={exportCSV} className="download-icon"/>
                                    </OverlayTrigger>
                                    <div className='upload-file'>
                                        <CSVReader onDrop={handleOnDrop} onError={handleOnError} addRemoveButton onRemoveFile={handleOnRemoveFile} >
                                            <span className="file-name">Drop CSV file here or click to upload.</span>
                                        </CSVReader>
                                    </div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <button type="button" className='btn btn-primary btn-sm' disabled={CSVFileData.length == 0} id='parse_csv_btn' onClick={addSetupDataFromCSV}>Parse CSV</button>
                                    &nbsp;
                                    {FileReadMsg.length > 0 &&
                                        <div className='csv_errors_div'>
                                            Errors &nbsp;&nbsp;
                                            <OverlayTrigger trigger="click" placement="right" overlay={popover} rootClose>
                                                <span className="text-white rounded shadow-outline badge badge-danger csv_errors_count">{FileReadMsg.length}</span>
                                            </OverlayTrigger>
                                        </div>
                                    }
                                </div>
                            </div>:
                            <div className="col-sm-8"></div>
                        }
                        <div className="col-sm-2">
                            <button type="button" className='btn btn-primary btn-sm' onClick={handleShowRankModal} id="rank_btn">Ranking Table</button>
                        </div>
                    </div>
                </div>
            </form>

            {SetupData.length > 0 && 
                <div>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                {role === 'admin_user' && <th scope="col" className='p_select'>Action</th>}
                                <th scope="col">Client Name</th>
                                <th scope="col" >Workshop</th>
                                <th scope="col">Equipment Type</th>
                                <th scope="col" >Tech </th>
                                <th scope="col" >Film Type</th>
                                <th scope="col" >Machine Category</th>
                                <th scope="col" >Mask Category</th>
                                <th scope="col" >Quality</th>
                                <th scope="col" >Code Identifier</th>
                                <th scope="col" >Film Type</th>
                            </tr>
                            <tr>
                                {role === 'admin_user' && <th scope="col" className='p_select'></th>}
                                <th scope="col"><input type="search" placeholder="Search" name='s_client_name' value={SearchValue['s_client_name'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_workshop' value={SearchValue['s_workshop'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_equipment' value={SearchValue['s_equipment'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_geometry' value={SearchValue['s_geometry'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_film_type' value={SearchValue['s_film_type'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_machine_category' value={SearchValue['s_machine_category'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_mask_category' value={SearchValue['s_mask_category'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_quality' value={SearchValue['s_quality'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_code_identifier' value={SearchValue['s_code_identifier'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                                <th scope="col"><input type="search" placeholder="Search" name='s_film_component' value={SearchValue['s_film_component'] || ''} onChange={(event) => search(event)} className="form-control-sm " /></th>
                            </tr>
                        </thead>
                    </table>
                    <div id='add-scrollbar' className='setup_table'>
                        <table className="table table-bordered table-striped">
                            <tbody>
                                {filteredData.map((item, i) =>
                                    <tr key={i}>
                                        {role === 'admin_user' && 
                                            <td className='p_select'>
                                                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Remove record")}>
                                                    <Delete onClick={() => deleteRow(item.FilmComponent_KEY)} className='delete-icon'/>
                                                </OverlayTrigger>
                                                <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={renderTooltip("Edit record")}>
                                                    <Edit onClick={() => editRow(item.FilmComponent_KEY)} className='edit-icon'/>
                                                </OverlayTrigger>
                                            </td>
                                        }
                                        <td >{item.ClientName}</td>
                                        <td >{item.Workshop}</td>
                                        <td >{item.Equipment}</td>
                                        <td >{item.Tech}</td>
                                        <td >{item.FilmType}</td>
                                        <td >{item.MachineCategory}</td>
                                        <td >{item.MaskCategory}</td>
                                        <td >{item.Quality}</td>
                                        <td >{item.CodeIdentifier}</td>
                                        <td >{item.FilmComponent}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            }
        </>
    )
}