/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import './css/codemirror.css';
import Interpreter from './components/interpreter/Interpreter';
import Projects from './components/Projects.js';
import Header from './components/Header.js';
import TurtleLogo from './components/TurtleLogoWorkspace';
import JSLogo from './components/JSLogoWorkspace';
import NewProjectModal from './components/NewProjectModal';
import { options, languageDef, configuration } from './components/editorOptions'
import { Link, Route, BrowserRouter, useHistory } from "react-router-dom";

var interpreter;
var projects;

//TODO: Make 'unsavedChanges' global, since it's going to affect multiple things later

class App extends Component {


  chartRef = {}
  state = {
    turtle: true,
    workspace: "turtle",
    unsavedChanges: false,
    showNewProjectModal: false,
    linesOfCode: [1],
    code:
      `to go
  print 5
end`,
    canvasHeight: 400,
    canvasWidth: 900,
    showChartFrame: false,
    chartType: "Single Scatter",
    chartData: [],
    chartDataSecond: []
  };

  //Chartype Key:
  //1 - Single Scatter
  //2 - Double Scatter


  componentDidMount() {
    console.log("Serial API Check:");
    console.log(this.checkIfSerialCapable());
    var canvasHeight = document.getElementById("cnvframe").clientHeight;
    var canvasWidth = document.getElementById("cnvframe").clientWidth;
    this.setState({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth
    });

    interpreter = new Interpreter(document.getElementById("cnvframe").offsetHeight, document.getElementById("cnvframe").offsetWidth, this.addToChart.bind(this));
    projects = new Projects(this.updateCode.bind(this));
    //interpreter.setup();

    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', interpreter.openSerialPort.bind(interpreter));

    const disconnectButton = document.getElementById('disconnectButton');
    disconnectButton.addEventListener('click', interpreter.disconnectSerialPort.bind(interpreter));
    this.countLineAndSetState();
  }


  componentDidUpdate() {
    interpreter.readProcs();

  }


  addToChart(x, y) {
    var newData = this.state.chartData;
    newData.push({ x: x, y: y });
    this.setState({ chartData: newData });
  }

  checkIfSerialCapable = () => {
    if ('serial' in navigator) {
      return true;
    } else {
      return false
    }
  }


  chartToggle() {
    this.setState({ chartToggle: !this.state.chartToggle });
    document.getElementById("chartFrame").classList.toggle("hide");
    document.getElementById("cnvframe").classList.toggle("hide");

  }



  updateCode(newCode) {
    this.setState({
      code: newCode,
    });
  }


  countLineAndSetStateForIncludes() {
    var count = document.getElementById('includes').value.split(/\r\n|\r|\n/).length;
    var countArray = Array.from(Array(count + 1).keys());
    countArray.shift();
    this.setState({
      linesOfCode: countArray
    });
  }

  countLineAndSetState() {

    var count = document.getElementById('procs').value.split(/\r\n|\r|\n/).length;
    var countArray = Array.from(Array(count + 1).keys());
    countArray.shift();
    this.setState({
      linesOfCode: countArray,
      unsavedChanges: true
    });

  }

  toggleShowNewProjectModal() {
    this.setState({ showNewProjectModal: !this.state.showNewProjectModal });
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

  editorDidMount(editor, monaco) {
    editor.focus();
  }

  toggleTurtle(){
    this.setState({turtle: !this.state.turtle})
    if(this.state.turtle == true){
      interpreter = new Interpreter(document.getElementById("cnvframe").offsetHeight, document.getElementById("cnvframe").offsetWidth, this.addToChart.bind(this));
      interpreter.setup()
    }
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
      <div>
        <Header
          toggleNewProjectModal={this.toggleShowNewProjectModal.bind(this)}
          interpreter={this.interpreter}
          chartToggle={this.chartToggle}
        />
        <div className="main">

          <p>Click 'connect' to start, then select the Arduino device. Defining a 'go' word allows you to run
          things by clicking 'go', or you can use the terminal at the bottom. Use dp3on to turn on pin 3, read0 to read the sensor on A0. Requires Chrome. The chart can be updated with chartpush x y.
      <br />
          </p>
          {this.state.showNewProjectModal ?
            <NewProjectModal
              toggleModal={this.toggleShowNewProjectModal.bind(this)}
              countLines={this.countLineAndSetState.bind(this)}
              unsavedChanges={this.state.unsavedChanges}
              updateCode={this.updateCode.bind(this)}
            />

            :
            null}
          <button id="gobutton" onClick={() => { interpreter.runLine("go") }}>Go</button>
          <span style={{ width: "10px" }}></span>
          <button id="chartToggle" onClick={() => this.chartToggle()}>Toggle Chart</button>
          <input id="load" type="file" onChange={() => projects.loadFile()} style={{ display: "none" }} />
          <button onClick={() => this.toggleTurtle()}>Turtle On/Off</button>
          <button onClick={() => this.setState({chartType: "Single Scatter"})}>Single Chart</button>
          <button onClick={() => this.setState({chartType: "Double Scatter"})}>Double Chart</button>
        </div>

          <div>
            {this.state.turtle ? 
                            <TurtleLogo
                            code={this.state.code}
                            updateCode={this.updateCode.bind(this)}
                            editorDidMount={this.editorDidMount}
                            editorWillMount={this.editorWillMount}
                            interpreter={interpreter}
                            chartType={this.state.chartType}
                          />
                          :
                          <JSLogo
                          code={this.state.code}
                          updateCode={this.updateCode.bind(this)}
                          editorDidMount={this.editorDidMount}
                          editorWillMount={this.editorWillMount}
                          interpreter={interpreter}
                          options={options}
                          chartType={this.state.chartType}
                        />
          
          }

          </div>
       

      </div >
    );
  }
}





export default App;


/*

 <Scatter
                data={{
                  datasets:
                    [
                      {
                        label: "Temp. vs Time",
                        data: this.state.chartData
                      }

                    ]
                }}


                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 0
                  },
                  elements: {
                    point: {
                      radius: 4,
                      backgroundColor: "black"
                    }
                  }
                }
                }
                redraw={true}
                ref={this.chartReference}
              />

*/