/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, { useEffect } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import MonacoEditor from 'react-monaco-editor';
import Chart from './Chart';
import DataTable from './DataTable';
import Terminal from './Terminal';


function TurtleLogo(props) {
  const options = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    minimap: {
      enabled: false
    },
  };


  useEffect(() => {

  })




  return (
    <div className="interfaceGrid">
      <div className="codeEntry" id="codeEntryDiv">
        <MonacoEditor
          language="jslogo"
          theme="jslogo"
          value={props.code}
          options={options}
          onChange={props.updateCode}
          editorDidMount={props.editorDidMount}
          editorWillMount={props.editorWillMount}
        />
        <textarea id="procs" spellCheck="false" onChange={props.countLineAndSetState} style={{ whiteSpace: "nowrap", display: "none" }} value={props.code} >
        </textarea>
        <textarea id="includes" spellCheck="false" style={{ display: "none", whiteSpace: "nowrap", overflow: "visible" }} />
      </div>

      <div className="chartArea" id="chartAreaWrapper">
        <div id="cnvframe" className={props.view == "main" ? null: "hide"} style={{ height: "100%", width: "100%" }}>
          <canvas className="cnv" id="canvas" ></canvas>
        </div>
        <div id="chartFrame" className={props.view == "graph" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
          <Chart 
            chartType={props.chartType}
            chartDataSingle={props.chartDataSingle}
            chartDataTop={props.chartDataTop}
            chartDataBottom={props.chartDataBottom}
            chartOptionsTop={props.chartOptionsTop}
            chartOptionsBottom={props.chartOptionsBottom}
            chartOptionsSingle={props.chartOptionsSingle}
            
           />

        </div>
        <div id="dataFrame" className={props.view == "data" ? null: "hide"} style={{height: "100%", width: "100%"}}>
            <DataTable
              tableData = {props.tableData} 
            />
          </div>
      </div>


        <Terminal 
          interpreter = {props.interpreter}
        />
        <textarea id="cc" onKeyDown={(e) => props.interpreter.handleCCKeyDown(e)} style={{display: "none"}}></textarea>

    </div>
  )

}

export default TurtleLogo;
