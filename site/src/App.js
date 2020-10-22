import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import './css/codemirror.css';
import Interpreter from './components/interpreter/Interpreter';
import { Scatter } from 'react-chartjs-2';
import includes from './components/interpreter/includes.js'
import Projects from './components/Projects.js';
import Header from './components/Header.js';
import NewProjectModal from './components/NewProjectModal'

var interpreter;
var projects;

//var chartReference = React.createRef();


class App extends Component {

  
  chartRef = {}
  state = {
    showNewProjectModal: false,
    linesOfCode: [1],
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
    projects = new Projects(this.updateCode);
    interpreter.setup();

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

  showCode() {
    document.getElementById('includes').style.display = "none";
    document.getElementById('procs').style.display = "block";
    this.countLineAndSetState();
  }

  showIncludes() {
    document.getElementById('includes').style.display = "block";
    document.getElementById('procs').style.display = "none";
    this.countLineAndSetStateForIncludes();
  }

  updateCode(newCode) {
    this.setState({
      code: newCode,
    });
  }


  countLineAndSetStateForIncludes(){
    var count = document.getElementById('includes').value.split(/\r\n|\r|\n/).length;
    var countArray = Array.from(Array(count + 1).keys());
    countArray.shift();
    this.setState({
      linesOfCode: countArray
    });
  }

  countLineAndSetState(){
    var count = document.getElementById('procs').value.split(/\r\n|\r|\n/).length;
    var countArray = Array.from(Array(count + 1).keys());
    countArray.shift();
    this.setState({
      linesOfCode: countArray
    });
  }

  toggleShowNewProjectModal(){
    this.setState({showNewProjectModal: !this.state.showNewProjectModal});
  }


  render() {
    return (
      <div>
        <Header toggleNewProjectModal={this.toggleShowNewProjectModal.bind(this)}/>
        <div className="main">
         
          <p>Click 'connect' to start, then select the Arduino device. Defining a 'go' word allows you to run
          things by clicking 'go', or you can use the terminal at the bottom. Use dp3on to turn on pin 3, read0 to read the sensor on A0. Requires Chrome. The chart can be updated with chartpush x y.
      <br />
      </p>
      {this.state.showNewProjectModal ? <NewProjectModal toggleModal={this.toggleShowNewProjectModal.bind(this)} countLines={this.countLineAndSetState.bind(this)}/> : null }
       
          <button id="connectButton" type="button" >Connect</button>
          <button id="disconnectButton" type="button" style={{ display: "none" }}>Disconnect</button>
          <button id="gobutton" onClick={() => { interpreter.runLine("go") }}>Go</button>
          <button id="chartToggle" onClick={() => this.chartToggle()}>Toggle Chart</button>
          <input id="load" type="file" onChange={() => projects.loadFile()} style={{display: "none"}}/>
          <br /><br />
          <span style={{ float: "left", marginRight: "20px" }} onClick={() => { this.showCode() }}>Code</span><span style={{ float: "left" }} onClick={() => { this.showIncludes() }}>Includes</span>
          <br />
        </div>
        <div className="interfaceGrid">
          <div className="codeEntry" id="codeEntryDiv" style={{ border: "1px solid black" }}>
          <div id="gutter">
              {this.state.linesOfCode.map((number) => 
                <span key={number}>{number}<br/></span> )}
            </div>
            <textarea id="procs" spellCheck="false" onChange={this.countLineAndSetState.bind(this)} defaultValue=
{`to go
  printSomething 5
end

to printSomething :n
  print :n
end`}
            >
            </textarea>
            <textarea id="includes" spellCheck="false" defaultValue={includes} style={{ display: "none" }} />
          </div>

          <div className="codeEntry" id="includesWrapper" style={{ display: "none" }}>
            <textarea id="includes" spellCheck="false" defaultValue={includes}/>
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