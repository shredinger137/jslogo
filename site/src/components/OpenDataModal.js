import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { config } from '../config';

const OpenDataModal = (props) => {

const [availableData, setAvailableData] = useState([]);

useEffect(() => {

        axios.get(`${config.apiUrl}/data/${props.pid}`, {
        }).then(response => {
           if(response && response.data && Array.isArray(response.data)){
               setAvailableData(response.data)
           }
        })
    
},
    []
)

const getData = (index) => {
    axios.get(`${config.apiUrl}/data/${props.pid}/${index}`, {
    }).then(response => {
       if(response && response.data){          
           console.log(response.data)
           props.setTableData(response.data);
           props.toggleModal();
       }
    })
}

const convertDate = (unixtime) => {
    let date = new Date(unixtime);
    let converted = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return converted;
}


return (
    <div id="dataModal" className="modal" onClick={() => props.toggleModal()}>
    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => props.toggleModal()}>&times;</span>
        <h3>Load Data</h3>
        <br />
        <div>
            <p>This feature is under development and shouldn't be relied on quite yet.</p>
            {availableData.map(item => (
                <div key={item} onClick={() => {getData(item)}}>
                {convertDate(item)}<br/><br />
                </div>
            ))}
        </div>
    </div>
</div>
)

}


export default OpenDataModal;