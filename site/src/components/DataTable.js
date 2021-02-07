/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React from 'react';

function DataTable(props) {


    function exportData() {
        var filename = "data.csv";
        var textToSave = "Time,ADC0,ADC1,ADC2,ADC3,ADC4,ADC5\n";
        console.log(props.tableData);
        if (props.tableData) {
            console.log("if");
            for (var dataLine of props.tableData) {
                console.log(dataLine);
                console.log(dataLine.length)
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



    return (
        <div style={{ overflow: "scroll", height: "100%", width: "100%" }}>
            <span onClick={exportData.bind(this)}>Export Data</span>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>ADC0</th>
                        <th>ADC1</th>
                        <th>ADC2</th>
                        <th>ADC3</th>
                        <th>ADC4</th>
                        <th>ADC5</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData.map(dataLine => {
                        return (
                            <tr key={`${dataLine[0]}row`}>
                                <td key={dataLine[0]} >{dataLine[0]}</td>
                                <td key={dataLine[1]}>{dataLine[1]}</td>
                                <td key={dataLine[2]}>{dataLine[2]}</td>
                                <td key={dataLine[3]}>{dataLine[3]}</td>
                                <td key={dataLine[4]}>{dataLine[4]}</td>
                                <td key={dataLine[5]}>{dataLine[5]}</td>
                                <td key={dataLine[6]}>{dataLine[6]}</td>
                            </tr>
                        )

                    })}
                </tbody>
            </table>
        </div>
    )
}

export default DataTable;