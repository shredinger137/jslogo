/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React from 'react';

function DataTable(props) {


    function pickFile() {
        if (document.getElementById("loadData") !== null) {
            document.getElementById("loadData").click();
        }

    }



    function importData() {

        //Parse a file made up of lines of space delineated text, create a 2d array for mapping

        //So far this doesn't create values that can be referenced or used for playback

        //Also doesn't necessarily cover all packet types. I'm making some assumptions about file structure here.

        //Note that we may need to support different 'types' later, but that's a discussion.

        var parsedFile = [];
        var typed = false;

        const input = document.getElementById("loadData");
        const file = input.files[0];
        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent, context) {

            var textFromFileLoaded = fileLoadedEvent.target.result;
            if (textFromFileLoaded.charAt(0) == "T" && textFromFileLoaded.charAt(0) != 'i') {
                console.log("T");
                typed = true;
            }

            var textInLines = textFromFileLoaded.split("\n"); //create an array of lines

            for (var line of textInLines) {
                var lineData = line.split(" ");
                if (typed) {
                    lineData.splice(2, 2);
                    lineData.shift();
                    lineData.pop();
                }

                parsedFile.push(lineData);

            }

            props.setTableData(parsedFile);

        }

        fileReader.readAsText(file, "UTF-8");

    }

    function exportData() {
        var filename = "data.csv";
        var textToSave = "Time,ADC0,ADC1,ADC2,ADC3,ADC4,ADC5\n";
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


    let row = 0;
    return (
        <div style={{ overflow: "scroll", height: "100%", width: "100%" }}>
            <span onClick={exportData.bind(this)}>Export</span>
            <input id="loadData" type="file" accept=".csv, .pac" onChange={() => importData()} style={{ display: "none" }} />
            <span onClick={pickFile} style={{ marginLeft: "20px" }}>Import</span>
            <span style={{ marginLeft: "20px" }}>{props.pid ? 'Save' : null}</span>
            <table style={{ width: "80%" }}>
                <thead style={{ textAlign: "left" }}>
                    <tr>
                        <th>Type</th>
                        <th>Time</th>
                        <th>ADC0</th>
                        <th>ADC1</th>
                        <th>ADC2</th>
                        <th>ADC3</th>
                        <th>ADC4</th>
                        <th>ADC5</th>
                        <th>CHCK</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData.map(dataLine => {
                        //hack to stop getting warnings about matchine keys when time is the same (less than a second)
                        row++;
                        return (
                            <tr key={`${dataLine[0]}row${row}`}>
                                <td key={`${dataLine[0]}${row}type`} >{dataLine[0]}</td>
                                <td key={`${dataLine[0]}${row}time`} >{dataLine[1]}</td>
                                <td key={`${dataLine[0]}${row}1`}>{dataLine[2]}</td>
                                {
                                    dataLine.length > 4 ?
                                        <td key={`${dataLine[0]}${row}2`}>{dataLine[3]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 5 ?
                                        <td key={`${dataLine[0]}${row}3`}>{dataLine[4]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 6 ?
                                        <td key={`${dataLine[0]}${row}4`}>{dataLine[5]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 7 ?
                                        <td key={`${dataLine[0]}${row}5`}>{dataLine[6]}</td>
                                        :
                                        <td></td>
                                }
                                {
                                    dataLine.length > 8 ?
                                        <td key={`${dataLine[0]}${row}6`}>{dataLine[7]}</td>
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