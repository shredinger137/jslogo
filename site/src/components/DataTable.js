/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, {useState} from 'react';
import firebase from 'firebase/app';
//we need firebase because we're saving data files to the cloud, and we want to authorize people
import axios from 'axios';
import { config } from '../config';
import OpenDataModal from './OpenDataModal';



function DataTable(props) {

    const [dataModalOpen, setDataModalOpen] = useState(false);

    const toggleModal = () => {
        setDataModalOpen(!dataModalOpen);
    }


    function pickFile() {
        if (document.getElementById("loadData") !== null) {
            document.getElementById("loadData").click();
        }

    }



    function importData() {

        //In the current version of packets we expect 9 columns - Type, Time, ADC 0 - 5, Checksum. Even if all the sensors aren't used,
        //this is what we're looking for. CSV is comma deli... comma is used to separate the columns.

        var parsedFile = [];

        const input = document.getElementById("loadData");
        const file = input.files[0];
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent, context) {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var textInLines = textFromFileLoaded.split("\n"); //create an array of lines
            textInLines.shift(); //remove header; we assume it exists but should probably check

            for (var line of textInLines) {
                var lineData = line.split(",");
                parsedFile.push(lineData);
            }

            props.setTableData(parsedFile);

        }

        fileReader.readAsText(file, "UTF-8");

    }

    function exportData() {
        var filename = "data.csv";
        var textToSave = "Type,Time,Count,ADC0,ADC1,ADC2,ADC3,ADC4,ADC5,CHCK\n";
        console.log(props.tableData);
        if (props.tableData) {
            for (var dataLine of props.tableData) {
                for (var i = 0; i < dataLine.length; i++) {
                    console.log("for", i);
                    if (i == 0) {
                        textToSave += dataLine[0];
                    } else {
                        textToSave += "," + dataLine[i];
                    }
                }
                textToSave += "\n";

            }
            var newFile = new Blob([textToSave], { type: 'plain/text' });
            var a = document.createElement("a"),
                url = URL.createObjectURL(newFile);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }

    }

    const saveToCloud = () => {
        firebase.auth().currentUser.getIdToken(false).then(idToken => {

            axios.post(`${config.apiUrl}/data/${props.projectId}`, {
                authorization: idToken,
                data: props.tableData,
            }).then((response) => {
                console.log(response)
            }).catch((err) => { console.log(err) })


        })
    }


    let row = 0;
    return (
        <div style={{ overflow: "scroll", height: "100%", width: "100%" }}>
            {dataModalOpen ? <OpenDataModal toggleModal={toggleModal} pid={props.projectId} setTableData={props.setTableData}/> : null}
            <span onClick={exportData.bind(this)} style={{cursor: 'pointer'}}>Export</span>
            <input id="loadData" type="file" accept=".csv, .pac" onChange={() => importData()} style={{ display: "none" }} />
            <span onClick={pickFile} style={{ marginLeft: "20px", cursor: 'pointer' }}>Import</span>
            {props.projectId && props.tableData ?
                <>
                    <span onClick={saveToCloud} style={{ marginLeft: "20px", cursor: 'pointer' }}>Save</span>
                    <span onClick={() => {toggleModal()}} style={{ marginLeft: "20px", cursor: 'pointer' }}>Open</span>
                </>
                :
                <>
                    <span style={{ marginLeft: "20px", color: 'gray' }}>Save</span>
                    <span style={{ marginLeft: "20px", color: 'gray' }}>Open</span>
                </>
            }

            <span style={{ marginLeft: "20px" }}>{props.pid ? 'Save' : null}</span>
            <table style={{ width: "80%" }}>
                <thead style={{ textAlign: "center" }}>
                    <tr>
                        <th>Type</th>
                        <th>Time</th>
                        <th>Count</th>
                        <th>ADC0</th>
                        <th>ADC1</th>
                        <th>ADC2</th>
                        <th>ADC3</th>
                        <th>ADC4</th>
                        <th>ADC5</th>
                        <th>CHCK</th>
                    </tr>
                </thead>
                <tbody style={{ textAlign: 'center' }}>
                    {props.tableData.map(dataLine => {
                        //hack to stop getting warnings about matching keys when time is the same (less than a second)
                        row++;
                        return (
                            <tr key={`${dataLine[0]}row${row}`}>
                                <td key={`${dataLine[0]}${row}type`} >{dataLine[0]}</td>
                                <td key={`${dataLine[0]}${row}time`} >{dataLine[1]}</td>
                                <td key={`${dataLine[0]}${row}1`}>{dataLine[2]}</td>
                                <td key={`${dataLine[0]}${row}count`}>{dataLine[3]}</td>
                                {
                                    dataLine.length > 5 ?
                                        <td key={`${dataLine[0]}${row}2`}>{dataLine[4]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 6 ?
                                        <td key={`${dataLine[0]}${row}3`}>{dataLine[5]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 7 ?
                                        <td key={`${dataLine[0]}${row}4`}>{dataLine[6]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 8 ?
                                        <td key={`${dataLine[0]}${row}5`}>{dataLine[7]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 9 ?
                                        <td key={`${dataLine[0]}${row}6`}>{dataLine[8]}</td>
                                        :
                                        <td></td>
                                }

                                <td key={`${dataLine[0]}${row}check`}>{dataLine[dataLine.length - 1]}</td>
                            </tr>
                        )

                    })}
                </tbody>
            </table>
        </div>
    )
}

export default DataTable;