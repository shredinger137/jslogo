/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", react-hooks/exhaustive-deps: off */


import React, { useEffect, useState } from 'react';
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

const App = () => {

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [view, setView] = useState('main');
  const [tableData, setTableData] = useState([]);
  const [code, setCode] = useState(`to go
print 'Hello World'
end`,);
  //pid is a placeholder; this needs to be put into global state
  let pid = null;
  var editor = null;

  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [chartType, setChartType] = useState('');
  const [chartDataSingle, setChartDataSingle] = useState([]);
  const [chartDataTop, setChartDataTop] = useState([]);
  const [chartDataBottom, setChartDataBottom] = useState([]);
  const [chartOptionsTop, setChartOptionsTop] = useState({

    responsive: true,
    maintainAspectRatio: false,
  });

  const [chartOptionsBottom, setChartOptionsBottom] = useState({

    responsive: true,
    maintainAspectRatio: false,
  });
  const [chartOptionsSingle, setChartOptionsSingle] = useState({

    responsive: true,
    maintainAspectRatio: false,
  });



  useEffect(() => {
    setup();
  },
    []
  );


  const setup = () => {

    console.log("Serial API Check:", checkIfSerialCapable());

    setHorizontalOffset(document.getElementById("gutter").getBoundingClientRect().left);

    interpreter = new Interpreter(
      {
        updateChartOptions: updateChartOptions,
        updateChartType: updateChartType,
        pushNewChartData: pushChartData,
        pushToTable: pushToDataTable,
      }
    );

    projects = new Projects(updateCode);
    interpreter.setup();

    window.onresize = interpreter.handleResize.bind(interpreter);

    const connectButton = document.getElementById('connectButton');
    const disconnectButton = document.getElementById('disconnectButton');

    if (connectButton !== null && disconnectButton !== null) {
      connectButton.addEventListener('keydown', (e) => { if (e.key == "Enter") { interpreter.openSerialPort.bind(interpreter) } });
      disconnectButton.addEventListener('keydown', (e) => { if (e.key == "Enter") { interpreter.disconnectSerialPort.bind(interpreter) } });

      connectButton.addEventListener('click', interpreter.openSerialPort.bind(interpreter));
      disconnectButton.addEventListener('click', interpreter.disconnectSerialPort.bind(interpreter));
    }

    ////    this.setState({
    //     includes: includes
    //    });

  }

  const dragToResize = (e) => {

    let context = this;
    e.preventDefault();

    function handleDrag(e) {
      interpreter.handleResizeHorizontal(e.clientX - horizontalOffset);
    }

    function handleMouseUp(e) {
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', handleMouseUp)
      return;
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleDrag)
  }


  const setDataTable = (newData) => {
    setTableData(newData);
  }

  const updateChartType = (newType) => {
    setChartType(newType);
  }

  const updateChartOptions = (chartType, newOptions) => {
    if (chartType == "single") {
      setChartOptionsSingle(newOptions)
    }

    if (chartType == "top") {
      setChartOptionsTop(newOptions);
    }

    if (chartType == "bottom") {
      setChartOptionsBottom(newOptions);
    }

  }


  const pushChartData = (chartType, newData) => {
    if (chartType == "single") {
      setChartDataSingle(newData);
      return;
    }
    if (chartType == "top") {
      setChartDataTop(newData);
      return
    }
    if (chartType == "bottom") {
      setChartOptionsBottom(newData);
      return;
    }

  }

  const checkIfSerialCapable = () => {
    if ('serial' in navigator) {
      return true;
    } else {
      return false
    }
  }

  const pushToDataTable = (newDataLine) => {


    if (newDataLine == false) {
      setTableData([[]])
    }

    let newData = tableData;
    newData.push(newDataLine);
    setTableData(
      newData
    )
  }

  const updateCode = (newCode) => {
    setCode(newCode);
  }


  const toggleShowNewProjectModal = () => {
    setShowNewProjectModal(!showNewProjectModal);
  }


  const editorWillMount = monaco => {
    editor = monaco
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

  const editorDidMount = (editor, monaco) => {
    editor.focus();
  }


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
        toggleNewProjectModal={toggleShowNewProjectModal}
        interpreter={interpreter}
        updateCode={updateCode}
      />
      <div style={{ height: "20px" }}></div>
      <div className="main">
        {showNewProjectModal ?
          <NewProjectModal
            toggleModal={toggleShowNewProjectModal}
            updateCode={updateCode}
          />
          :
          null}
        <div className="top-buttons">

          <ul>
            <li id="go-button" onClick={() => { interpreter.runLine("go") }} tabIndex="0">Go</li>
          </ul>
          <ul id="view-tabs">
            <li tabIndex="0" onKeyDown={(e) => { if (e.key == "Enter") { setView('main') } }} onClick={() => { setView('main'); interpreter.runLine("st") }} className={view == "main" ? "activeButton" : null} >Canvas</li>
            <li tabIndex="0" onKeyDown={(e) => { if (e.key == "Enter") { setView('graph') } }} onClick={() => setView('graph')} className={view == "graph" ? "activeButton" : null}>Plots</li>
            <li tabIndex="0" onKeyDown={(e) => { if (e.key == "Enter") { setView('data') } }} onClick={() => setView('data')} className={view == "data" ? "activeButton" : null}>Data</li>
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
            value={code}
            options={options}
            onChange={updateCode}
            editorDidMount={editorDidMount}
            editorWillMount={editorWillMount}
          />

          <textarea id="procs" style={{ whiteSpace: "nowrap", display: "none" }} value={code} readOnly>
          </textarea>
          <textarea id="includes" spellCheck="false" style={{ display: "none", whiteSpace: "nowrap", overflow: "visible" }} />
        </div>

        <div id="gutter" onMouseDown={(e) => { dragToResize(e) }} ></div>
        <div className="chartArea" id="chartAreaWrapper">

          <div id="cnvframe" className={view == "main" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
            <canvas className="cnv" id="canvas" >
              <div className="turtle" id="turtle">
                <img id="turtleimage" src="turtle.svg" alt="Turtle avatar" />
              </div>
            </canvas>
          </div>

          <div id="chartFrame" className={view == "graph" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
            <Chart
              chartType={chartType}
              chartDataSingle={chartDataSingle}
              chartDataTop={chartDataTop}
              chartDataBottom={chartDataBottom}
              chartOptionsTop={chartOptionsTop}
              chartOptionsBottom={chartOptionsBottom}
              chartOptionsSingle={chartOptionsSingle}
            />

          </div>
          <div id="dataFrame" className={view == "data" ? null : "hide"} style={{ height: "100%", width: "100%" }}>
            <DataTable
              pid={pid}
              tableData={tableData}
              setTableData={setDataTable}
            />
          </div>
        </div>
        <Terminal
          interpreter={interpreter}
        />
      </div>
      <textarea id="includes" style={{ display: "none" }} value={includes} readOnly />
    </div >
  );

}

export default App;
