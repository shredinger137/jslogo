/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

//TODO: CountLinesAndSetState no longer valid; remove

import React, { Component, useEffect } from 'react';
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
import { includes } from './components/interpreter/includes.js';
import Dexie, { DBCoreRangeType } from 'dexie'


var interpreter;
var projects;
var localDatabase;

//TODO: Make 'unsavedChanges' global, since it's going to affect multiple things later. Or otherwise use it properly.



class App extends Component {


  chartRef = {}
  state = {
    tableData: [[]],
    view: "main",
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
    chartType: "single",
    chartOptionsSingle: {
      yLabel: "",
      xLabel: "",
      ticks: {}
    },
    chartDataSingle: [],
    chartOptionsTop: {
      yLabel: "",
      xLabel: "",
      ticks: {}
    },
    chartDataTop: [],
    chartOptionsBottom: {
      yLabel: "",
      xLabel: "",
      ticks: {}
    },
    chartDataBottom: [],
    logoVariables: [],
    
  };





  componentDidMount() {

    localDatabase = new Dexie('lbym');

    console.log("Serial API Check:");
    console.log(this.checkIfSerialCapable());

    var canvasHeight = document.getElementById("cnvframe").clientHeight;
    var canvasWidth = document.getElementById("cnvframe").clientWidth;

    this.setState({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
    });

    interpreter = new Interpreter(document.getElementById("cnvframe").offsetHeight,
                                  document.getElementById("cnvframe").offsetWidth, 
                                  this.addToChart.bind(this), 
                                  this.pushToDataTable.bind(this), 
                                  this.updateLogoVariables.bind(this),
                                  this.pushChartData.bind(this),
                                  this.updateChartOptions.bind(this),
                                  this.updateChartType.bind(this)
                                  );
    projects = new Projects(this.updateCode.bind(this));
    interpreter.setup();

    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', interpreter.openSerialPort.bind(interpreter));

    const disconnectButton = document.getElementById('disconnectButton');
    disconnectButton.addEventListener('click', interpreter.disconnectSerialPort.bind(interpreter));

    this.setState({
      includes: includes
    });
    this.countLineAndSetState();
    projects.initializeDatabase();

    projects.getRecoverEntry().then(recoveryProject => {
      if (recoveryProject && recoveryProject[0] && recoveryProject[0]['code']) {
        this.updateCode(recoveryProject[0]['code'])
      }
    });

    setInterval(() => {
      projects.writeLastCodeToLocalStorage(this.state.code);
    }, 10000);

  }


  componentDidUpdate() {
    interpreter.readProcs();

  }

  updateChartType(newType){
    this.setState({chartType: newType});
  }

  updateChartOptions(chartType, newOptions){
    if(chartType == "single"){
      this.setState({chartOptionsSingle: newOptions});
    }

    if(chartType == "top"){
      this.setState({chartOptionsTop: newOptions});
    }

    if(chartType == "bottom"){
      this.setState({chartOptionsBottom: newOptions});
    }
    
  }

  updateLogoVariables(newVariables) {
    this.setState({ logoVariables: newVariables });
  }

  addToChart(x, y) {
    var newData = this.state.chartData;
    newData.push({ x: x, y: y });
    this.setState({ chartData: newData });
  }

  pushChartData(chartType, newData) {
    if(chartType == "single"){
      this.setState({ chartDataSingle: newData });
      return;
    }
    if(chartType == "top"){
      this.setState({chartDataTop: newData});
      return
    }
    if(chartType == "bottom"){
      this.setState({chartDataBottom: newData});
      return;
    }
   
  }

  checkIfSerialCapable = () => {
    if ('serial' in navigator) {
      return true;
    } else {
      return false
    }
  }

  pushToDataTable(newDataLine) {
    var newData = this.state.tableData;
    newData.push(newDataLine);
    this.setState({
      tableData: newData
    })
  }



  updateCode(newCode) {
    this.setState({
      code: newCode,
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
        { token: 'number', foreground: 'ADD8E6'}
      ],
      colors: {
      },
    });


  }

  editorDidMount(editor, monaco) {
    editor.focus();
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
        <div style={{height: "20px"}}></div>
        <div className="main">
          {this.state.showNewProjectModal ?
            <NewProjectModal
              toggleModal={this.toggleShowNewProjectModal.bind(this)}
              countLines={this.countLineAndSetState.bind(this)}
              unsavedChanges={this.state.unsavedChanges}
              updateCode={this.updateCode.bind(this)}
            />

            :
            null}
          <button onClick={() => { interpreter.runLine("go") }}>Go</button>
          <button onClick={() => this.setState({ view: "main" })}>Main View</button>
          <button onClick={() => this.setState({ view: "graph" })}>Graph</button>
          <button onClick={() => this.setState({ view: "data" })}>Data</button>
          <input id="load" type="file" onChange={() => projects.loadFile()} style={{ display: "none" }} />       
          <span style={{float: "right"}}>Canvas: {this.state.canvasWidth} x {this.state.canvasHeight}</span>

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
              addToChart={this.addToChart.bind(this)}
              view={this.state.view}
              tableData={this.state.tableData}
              chartOptionsSingle={this.state.chartOptionsSingle}
              chartDataSingle={this.state.chartDataSingle}
              chartOptionsTop={this.state.chartOptionsTop}
              chartDataTop={this.state.chartDataTop}
              chartOptionsBottom={this.state.chartOptionsBottom}
              chartDataBottom={this.state.chartDataBottom}
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
              addToChart={this.addToChart.bind(this)}
              view={this.state.view}
              tableData={this.state.tableData}
              chartOptionsSingle={this.state.chartOptionsSingle}
              chartDataSingle={this.state.chartDataSingle}
              chartOptionsTop={this.state.chartOptionsTop}
              chartDataTop={this.state.chartDataTop}
              chartOptionsBottom={this.state.chartOptionsBottom}
              chartDataBottom={this.state.chartDataBottom}
            />

          }

        </div>
        <textarea id="includes" style={{ display: "none" }} value={this.state.includes} />


      </div >
    );
  }
}





export default App;