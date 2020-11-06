import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import MonacoEditor from 'react-monaco-editor';
import {Scatter} from 'react-chartjs-2'
import Interpreter from './interpreter/Interpreter';
import Chart from './Chart';

var interpreter;

export default class TurtleLogo extends Component {

  componentDidMount(){
    interpreter = new Interpreter(document.getElementById("cnvframe").offsetHeight, document.getElementById("cnvframe").offsetWidth, this.props.addToChart);
    interpreter.setup();
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
          <div id="cnvframe" style={{ height: "100%", width: "100%" }}>
            <canvas className="cnv" id="canvas" ></canvas>
          </div>
          <div id="chartFrame" className="hide" style={{ height: "100%", width: "100%" }}>
            <Chart 
              chartType={this.props.chartType}
             />

          </div>
        </div>

        <div className="terminal" id="terminal">
          <textarea id="cc" onKeyDown={(e) => interpreter.handleCCKeyDown(e)} ></textarea>
        </div>
      </div>
    )
  }

}