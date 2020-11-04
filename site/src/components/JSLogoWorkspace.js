import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import MonacoEditor from 'react-monaco-editor';


export default class JSLogo extends Component {

    render(){
        const options = {
            selectOnLineNumbers: true,
            automaticLayout: true,
            minimap: {
              enabled: false
            },
          };
        return(
          <>
            <div className="interfaceGridCode">
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
 
            <div className="terminal" id="terminal">
              <textarea id="cc" onKeyDown={(e) => this.props.interpreter.handleCCKeyDown(e)} ></textarea>
            </div>
          
          </div>
            
            <div className="chartArea">
              <div id="cnvframe" style={{ height: "100%", width: "100%" }}>
                <canvas className="cnv" id="canvas" ></canvas>
              </div>
              <div id="chartFrame" className="hide" style={{ height: "100%", width: "100%" }}>
                <p>Chart goes here</p>
  
              </div>
            </div>
            </>


        )
    }

}