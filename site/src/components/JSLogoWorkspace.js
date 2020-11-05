import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import MonacoEditor from 'react-monaco-editor';
import { options, languageDef, configuration } from './editorOptions'

//Create a conditional for chart state. Running 'initchart (argument)' sets state, so you display whatever data. 
//For multiple charts, try using an argument for 'which chart'. So, 'chartpush 1 5 4' adds point 5,4 to the first chart; 'chartpush 2 5 4' to chart 2. So forth.
//This doesn't cover overlay. Might be good to get a write up on which charts are needed, because those all have to be coded separately.
//These functions also all have to be passed to Interpreter to make them able to manage state, unless you figure out how to do global properly.


export default class JSLogo extends Component {

  componentDidUpdate(){
    console.log(this.props.code);
    console.log(this.props);
  }

  
  editorWillMount = monaco => {
    this.editor = monaco
    if (!monaco.languages.getLanguages().some(({ id }) => id === 'jslogo')) {
      // Register a new language
      monaco.languages.register({ id: 'jslogo' })
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('jslogo', languageDef)
      // Set the editing configuration for the language
      monaco.languages.setLanguageConfiguration('jslogo', configuration)
    }

    monaco.editor.defineTheme('jslogo', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'custom-words', foreground: 'FFFD8A' },
      ],
      colors: {
      },
    });


  }

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
                editorWillMount={this.editorWillMount}
              />
              <textarea id="procs" spellCheck="false" onChange={this.props.countLineAndSetState} style={{ whiteSpace: "nowrap", display: "none" }} value={this.props.code}>
              </textarea>
              <textarea id="includes" spellCheck="false" style={{ display: "none", whiteSpace: "nowrap", overflow: "visible" }} />
            </div>
 
            <div className="terminal" id="terminal">
              <textarea id="cc" onKeyDown={(e) => this.props.interpreter.handleCCKeyDown(e)} ></textarea>
            </div>
          
          </div>
            
            <div className="chartArea" style={{display: "none"}}>
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