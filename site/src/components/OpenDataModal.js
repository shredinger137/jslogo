/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", react-hooks/exhaustive-deps: off */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import { store } from '../redux/store';
import { load } from '../redux/reducers/packetDataSlice';

const OpenDataModal = (props) => {

    const [availableData, setAvailableData] = useState([]);

    useEffect(() => {

        axios.get(`${config.apiUrl}/data/${props.pid}`, {
        }).then(response => {
            if (response && response.data && Array.isArray(response.data)) {
                setAvailableData(response.data)
            }
        })

    },
        []
    )

    const getData = (index) => {
        axios.get(`${config.apiUrl}/data/${props.pid}/${index}`, {
        }).then(response => {
            if (response && response.data) {
                store.dispatch(load(response.data));
                props.toggleModal();
            }
        })
    }

    const convertDate = (unixtime) => {

        //takes number, returns string
        const twoDigit = (input) => {
            if (input < 10) {
                return `0${input}`
            }
            return input;
        }

        let date = new Date(unixtime);
        let converted = `${twoDigit(date.getMonth())}-${twoDigit(date.getDate())}-${date.getFullYear()} ${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}:${twoDigit(date.getSeconds())}`;
        return converted;
    }


    return (
        <div id="dataModal" className="modal" onClick={() => props.toggleModal()}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={() => props.toggleModal()}>&times;</span>
                <h3>Load Data</h3>
                <br />
                <div>
                    {availableData.map(item => (
                        <div style={{marginBottom: '10px', cursor: 'pointer'}} key={item} onClick={() => { getData(item) }}>
                            {convertDate(item)}<br />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}


export default OpenDataModal;