import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
// import ls from 'local-storage';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { api } from '../helpers/config';
import { UserInfo } from '../index';
import LoadingSpinner from '../helpers/LoadingSpinner';

interface RankingData {
    id: number;
    name: string;
    rank: number;
  }

export default function RankingTableModal(props) {

    const role = useContext(UserInfo)['admin_status'];

    const [RankingData, setRankingData] = useState<RankingData[]>([]);
    const [Loading, setLoading] = useState<boolean>(false);

    useEffect(()=>{
        getRankingTableData();
    },[]);

    const getRankingTableData = async () => {
        setLoading(true);

        try {
            const response = await axios.get(api.url + 'api/setup/get_rank_data', {
                withCredentials: true,
            });
            setRankingData(response.data.rows || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ranking data:', error);
        }
    }

    const handleOnDragEnd = (result: { source: { index: number }; destination: { index: number } | null }) => {
        if (!result.destination) return;
    
        const items = Array.from(RankingData);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
    
        setRankingData(items);
    }

    const editRankTable = async (e) => {
        e.preventDefault();
        setLoading(true);

        var bodyFormData = new FormData();
        bodyFormData.set('body', JSON.stringify(RankingData));
        
        try {
            const response = await axios.post(api.url + 'api/setup/update_rank_data', bodyFormData{
                withCredentials: true,
            });
            getRankingTableData();
        } catch (error) {
            console.error('Error updating ranking data:', error);
        }
        setLoading(false);
    }

    return (
        <Modal id="ranking_table_modal" show={props.isOpen} onHide={props.onClose} >
            <Modal.Header closeButton>
                <Modal.Title> 
                    Ranking Table
                    <div className="spinner">
                        {Loading && <LoadingSpinner/>}
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {role === "admin" ?
                    <> 
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                            <Droppable droppableId="characters">
                                {(provided) => (
                                    <table id="rank_table" className="table table-bordered table-striped" {...provided.droppableProps} ref={provided.innerRef}>
                                        <thead>
                                            <tr>
                                                <th className="p_rank">Rank</th>
                                                <th className="p_selector">Film Selector</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {RankingData && RankingData.map((item, i) => {
                                                return (
                                                    <Draggable key={item.RANK} draggableId={item.RANK} index={i}>
                                                        {(provided) => (
                                                            <tr key={i} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <td className="p_rank">{item.RANK}</td>
                                                                <td className="p_selector">{item.FILM_SELECTOR}</td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </tbody>
                                    </table>
                                )}
                            </Droppable>
                        </DragDropContext> 
                        <button type="submit" className='btn btn-primary btn-sm' onClick={editRankTable} id="rank_btn">Update</button>
                    </> :
                    <table id="rank_table" className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th className="p_rank">Rank</th>
                                <th className="p_selector">Film Selector</th>
                           </tr>
                        </thead>
                        <tbody>
                            {RankingData && RankingData.map((item, i) => 
                                <tr key={i}>
                                    <td className="p_rank">{item.RANK}</td>
                                   <td className="p_selector">{item.FILM_SELECTOR}</td>
                              </tr>
                            )}
                         </tbody>
                    </table>
                }
            </Modal.Body>
        </Modal>
    )
}