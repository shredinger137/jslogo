/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import MonacoEditor from 'react-monaco-editor';
import Chart from './Chart';
import DataTable from './DataTable';



export default class TurtleLogo extends Component {

  componentDidMount(){

  }

  componentDidUpdate(){
    console.log(this.props);
  }

  render() {
    const options = {
      selectOnLineNumbers: true,
      automaticLayout: true,
      minimap: {
        enabled: false
      },
    };
    return (
      <div className="interfaceGrid">
        <div className="codeEntry" id="codeEntryDiv" style={{ border: "1px solid black", maxHeight: "75vh", minHeight: "50vh" }}>
          <MonacoEditor
            language="jslogo"
            theme="jslogo"
            value={this.props.code}
            options={options}
            onChange={this.props.updateCode}
            editorDidMount={this.props.editorDidMount}
            editorWillMount={this.props.editorWillMount}
          />
          <textarea id="procs" spellCheck="false" onChange={this.props.countLineAndSetState} style={{ whiteSpace: "nowrap", display: "none" }} value={this.props.code} >
          </textarea>
          <textarea id="includes" spellCheck="false" style={{ display: "none", whiteSpace: "nowrap", overflow: "visible" }} />
        </div>

        <div className="chartArea">
          <div id="cnvframe" className={this.props.view == "main" ? null: "hide"} style={{ height: "100%", width: "100%" }}>
            <canvas className="cnv" id="canvas" ></canvas>
          </div>
          <div id="cnvframe" className={this.props.view == "test" ? null: "hide"} style={{ height: "100%", width: "100%" }}>
            <canvas id="testcanvas" style={{width: "100%", height: "100%"}}></canvas>
          </div>
          <div id="chartFrame" className={this.props.view == "graph" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
            <Chart 
              chartType={this.props.chartType}
              chartData={this.props.chartDataSingle}
             />

          </div>
          <div id="dataFrame" className={this.props.view == "data" ? null: "hide"} style={{height: "100%", width: "100%"}}>
              <DataTable
                tableData = {this.props.tableData} 
              />
            </div>
        </div>

        <div className="terminal" id="terminal">
          <textarea id="cc" onKeyDown={(e) => this.props.interpreter.handleCCKeyDown(e)} ></textarea>
        </div>
      </div>
    )
  }

}