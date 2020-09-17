import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import './css/codemirror.css';
import Interpreter from './components/interpreter/Interpreter';
import { Scatter } from 'react-chartjs-2';
import includes from './components/interpreter/includes.js'
import Projects from './components/Projects.js';
var CodeMirror = require('react-codemirror');

//We should look into CodeMirror-React2, which might provide better options for setting custom highlighting.
//See https://stackoverflow.com/questions/63185680/how-to-use-custom-codemirror-modes-using-react-codemirror2.

var interpreter;
var projects;

//TODO:
//Now that Code Mirror has been added, we're not using procs.value directly. Instead, procs.value is being set to hold the code value 
//for the interpreter to check. That means the browser has three copies of the entire code - the state, the procs.value and the code mirror divs.
//That doesn't seem like a good idea, so finding a better way to pass the code to 'interpreter' would be better.

class App extends Component {

  constructor(props) {
    super(props);
    this.chartReference = React.createRef();
  }

  chartRef = {}
  state = {
    code: 
`to go
  print 5
end`,
    canvasHeight: 400,
    canvasWidth: 900,
    showChartFrame: false,
    chartData:
      [
      ],
  };


  componentDidMount() {
    console.log("Serial API Check:");
    console.log(this.checkIfSerialCapable());
    var canvasHeight = document.getElementById("cnvframe").clientHeight;
    var canvasWidth = document.getElementById("cnvframe").clientWidth;
    this.setState({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth
    });


    this.setState({

    });


    interpreter = new Interpreter(document.getElementById("cnvframe").offsetHeight, document.getElementById("cnvframe").offsetWidth, this.addToChart.bind(this));
    projects = new Projects();
    interpreter.setup();

    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', interpreter.openSerialPort.bind(interpreter));

    const disconnectButton = document.getElementById('disconnectButton');
    disconnectButton.addEventListener('click', interpreter.disconnectSerialPort.bind(interpreter));

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


  async clickConnect() {
    await this.connectAndStartReading();
  }

  handleTerminalEntry(e) {
    if (e && e.keyCode === 13) {
      var terminalAllContent = document.getElementById("cc").value.split('\n').reverse();
      var terminalLastLine = terminalAllContent[0];
      this.interpretAndSend(terminalLastLine);

    }
  }

  chartToggle() {
    this.setState({ chartToggle: !this.state.chartToggle });
    document.getElementById("chartFrame").classList.toggle("hide");
    document.getElementById("cnvframe").classList.toggle("hide");



  }

  showCode() {
    document.getElementById('includesWrapper').style.display = "none";
    document.getElementById('codeEntryDiv').style.display = "block";
  }

  showIncludes() {
    document.getElementById('includesWrapper').style.display = "block";
    document.getElementById('codeEntryDiv').style.display = "none";
  }

  updateCode(newCode) {
    this.setState({
      code: newCode,
    });
  }


  render() {
    return (
      <div>
        <header className="header">
          <h1>Learning by Making</h1>
        </header>

        <div className="main">
          <p>Click 'connect' to start, then select the Arduino device. Defining a 'go' word allows you to run
          things by clicking 'go', or you can use the terminal at the bottom. Use dp3on to turn on pin 3, read0 to read the sensor on A0. Requires Chrome. The chart can be updated with chartpush x y.
      <br />
          </p>
          <button id="connectButton" type="button" >Connect</button>
          <button id="disconnectButton" type="button" style={{ display: "none" }}>Disconnect</button>
          <button id="gobutton" onClick={() => { interpreter.runLine("go") }}>Go</button>
          <button id="chartToggle" onClick={() => this.chartToggle()}>Toggle Chart</button>
          <span style={{ paddingLeft: "100px" }}>Load File:</span>
          <input id="load" type="file" onChange={() => projects.loadFile()} />
          <button id="saveAs" onClick={() => projects.saveAs()}>Save File</button>
          <br /><br />
          <span style={{ float: "left", marginRight: "20px" }} onClick={() => { this.showCode() }}>Code</span><span style={{ float: "left" }} onClick={() => { this.showIncludes() }}>Includes</span>
          <br />
        </div>
        <div className="interfaceGrid">
          <div className="codeEntry" id="codeEntryDiv" style={{ border: "1px solid black" }}>
            <textarea id="procs" value={this.state.code} style={{ display: "none" }}>
            </textarea>
            <CodeMirror value={this.state.code} onChange={this.updateCode.bind(this)} options={{ lineNumbers: true }} />
          </div>
          <div className="codeEntry" id="includesWrapper" style={{ display: "none" }}>
            <textarea id="includes" defaultValue={includes}
            />
          </div>
          <div className="chartArea">
            <div id="cnvframe" style={{ height: "100%", width: "100%" }}>
              <canvas className="cnv" id="canvas" ></canvas>
            </div>
            <div id="chartFrame" className="hide" style={{ height: "100%", width: "100%" }}>
              <Scatter
                data={{
                  datasets:
                    [
                      {
                        label: "Test",
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


            </div>
          </div>

          <div className="terminal" id="terminal">
            <textarea id="cc" onKeyDown={(e) => interpreter.handleCCKeyDown(e)} ></textarea>
          </div>
        </div>
      </div>
    );
  }
}





export default App;