/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import Interpreter from './components/interpreter/Interpreter';
import Projects from './components/Projects.js';
import Header from './components/Header.js';
import NewProjectModal from './components/NewProjectModal';
import { languageDef, configuration } from './components/editorOptions'
import { includes } from './components/interpreter/includes.js';
import MonacoEditor from 'react-monaco-editor';
import Chart from './components/Chart';
import DataTable from './components/DataTable';
import Terminal from './components/Terminal';
import 'firebase/auth';

let interpreter, projects;

class App extends Component {


  chartRef = {}
  state = {
    tableData: [[]],
    view: "main",
    showNewProjectModal: false,
    code:
      `to go
    print 'Hello World'
end`,
    canvasHeight: 400,
    canvasWidth: 900,
    chartType: "",
    chartOptionsSingle: {
      yLabel: "",
      xLabel: "",
      ticks: {},
      responsive: true
    },
    chartDataSingle: [],
    chartOptionsTop: {

      responsive: true,
      maintainAspectRatio: false,
    },

    chartDataTop: [],
    chartOptionsBottom: {
      responsive: true,
      maintainAspectRatio: false,
    },
    chartDataBottom: [],
    logoVariables: [],
    uid: null,
    uname: null,
    horizontalOffset: 0,
  };

  componentDidMount() {

    console.log("Serial API Check:", this.checkIfSerialCapable());

    this.setState({ horizontalOffset: document.getElementById("gutter").getBoundingClientRect().left })

    interpreter = new Interpreter(
      {
        updateChartOptions: this.updateChartOptions.bind(this),
        updateChartType: this.updateChartType.bind(this),
        pushNewChartData: this.pushChartData.bind(this),
        addToChart: this.addToChart.bind(this),
        pushToTable: this.pushToDataTable.bind(this)
      }
    );
    projects = new Projects(this.updateCode.bind(this));
    interpreter.setup();

    window.onresize = interpreter.handleResize.bind(interpreter);

    const connectButton = document.getElementById('connectButton');
    const disconnectButton = document.getElementById('disconnectButton');

    if (connectButton !== null && disconnectButton !== null) {
      connectButton.addEventListener('click', interpreter.openSerialPort.bind(interpreter));
      disconnectButton.addEventListener('click', interpreter.disconnectSerialPort.bind(interpreter));
    }

    this.setState({
      includes: includes
    });

  }

  dragToResize(e) {

    let context = this;
    e.preventDefault();

    function handleDrag(e) {
      interpreter.handleResizeHorizontal(e.clientX - context.state.horizontalOffset);
    }

    function handleMouseUp(e) {
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', handleMouseUp)
      return;
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleDrag)
  }


  setDataTable(newData) {
    this.setState({ tableData: newData })
  }

  updateChartType(newType) {
    this.setState({ chartType: newType });
  }

  updateChartOptions(chartType, newOptions) {
    if (chartType == "single") {
      this.setState({ chartOptionsSingle: newOptions });
    }

    if (chartType == "top") {
      this.setState({ chartOptionsTop: newOptions });
    }

    if (chartType == "bottom") {
      this.setState({ chartOptionsBottom: newOptions });
    }

  }

  updateLogoVariables(newVariables) {
    this.setState({ logoVariables: newVariables });
  }

  addToChart(x, y) {
    let newData = this.state.chartData;
    newData.push({ x: x, y: y });
    this.setState({ chartData: newData });
  }

  pushChartData(chartType, newData) {
    if (chartType == "single") {
      this.setState({ chartDataSingle: newData });
      return;
    }
    if (chartType == "top") {
      this.setState({ chartDataTop: newData });
      return
    }
    if (chartType == "bottom") {
      this.setState({ chartDataBottom: newData });
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

    if(newDataLine == false){
      this.setState({
        tableData: [[]]
      })
    }

    let newData = this.state.tableData;
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
        { token: 'custom-words', foreground: 'FF7F7F' },
        { token: 'numbers-custom', foreground: 'FFFD8A' }
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
      quickSuggestions: false,
      selectOnLineNumbers: true,
      automaticLayout: true,
      minimap: {
        enabled: false
      },
    };

    return (
      <div>
        <Header
          pid={this.state.pid}
          toggleNewProjectModal={this.toggleShowNewProjectModal.bind(this)}
          interpreter={this.interpreter}
          chartToggle={this.chartToggle}
          updateCode={this.updateCode.bind(this)}
        />
        <div style={{ height: "20px" }}></div>
        <div className="main">
          {this.state.showNewProjectModal ?
            <NewProjectModal
              toggleModal={this.toggleShowNewProjectModal.bind(this)}
              updateCode={this.updateCode.bind(this)}
            />
            :
            null}
          <div className="top-buttons">

            <ul>
              <li id="go-button" onClick={() => { interpreter.runLine("go") }}>Go</li>
            </ul>
            <ul id="view-tabs">
              <li onClick={() => { this.setState({ view: "main" }); interpreter.runLine("st") }} className={this.state.view == "main" ? "activeButton" : null}>Canvas</li>
              <li onClick={() => this.setState({ view: "graph" })} className={this.state.view == "graph" ? "activeButton" : null}>Plots</li>
              <li onClick={() => this.setState({ view: "data" })} className={this.state.view == "data" ? "activeButton" : null}>Data</li>
            </ul>
          </div>

          <input id="load" type="file" onChange={() => projects.loadFile()} style={{ display: "none" }} />
          <span style={{ float: "right" }} id="canvasDimensionsLabel"></span>

        </div>

        <div className="interfaceGrid" id="mainInterfaceGrid">
          <div className="codeEntry" id="codeEntryDiv">
            <MonacoEditor
              language="jslogo"
              theme="jslogo"
              value={this.state.code}
              options={options}
              onChange={this.updateCode.bind(this)}
              editorDidMount={this.editorDidMount}
              editorWillMount={this.editorWillMount}
            />

            <textarea id="procs" style={{ whiteSpace: "nowrap", display: "none" }} value={this.state.code} readOnly>
            </textarea>
            <textarea id="includes" spellCheck="false" style={{ display: "none", whiteSpace: "nowrap", overflow: "visible" }} />
          </div>

          <div id="gutter" onMouseDown={(e) => { this.dragToResize(e) }} ></div>
          <div className="chartArea" id="chartAreaWrapper">

            <div id="cnvframe" className={this.state.view == "main" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
              <canvas className="cnv" id="canvas" >
                <div className="turtle" id="turtle">
                  <img id="turtleimage" src="turtle.svg" alt="Turtle avatar" />
                </div>
              </canvas>
            </div>

            <div id="chartFrame" className={this.state.view == "graph" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
              <Chart
                chartType={this.state.chartType}
                chartDataSingle={this.state.chartDataSingle}
                chartDataTop={this.state.chartDataTop}
                chartDataBottom={this.state.chartDataBottom}
                chartOptionsTop={this.state.chartOptionsTop}
                chartOptionsBottom={this.state.chartOptionsBottom}
                chartOptionsSingle={this.state.chartOptionsSingle}
              />

            </div>
            <div id="dataFrame" className={this.state.view == "data" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
              <DataTable
                tableData={this.state.tableData}
                setTableData={this.setDataTable.bind(this)}
              />
            </div>
          </div>
          <Terminal
            interpreter={interpreter}
          />
        </div>
        <textarea id="includes" style={{ display: "none" }} value={this.state.includes} />
      </div >
    );
  }
}

export default App;