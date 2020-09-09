import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import Megaclass from './components/megaclass';
import { Scatter } from 'react-chartjs-2';
import includes from './components/includes.js'

var megaclass;

class App extends Component {

  constructor(props) {
    super(props);
    this.chartReference = React.createRef();
  }

  chartRef = {}
  state = {
    showChartFrame: false,
    chartData:
      [
      ],
  };


  componentDidMount() {



    this.setState({

    });


    megaclass = new Megaclass(document.getElementById("cnvframe").offsetHeight, document.getElementById("cnvframe").offsetWidth, this.addToChart.bind(this));
    megaclass.setuptl();
    megaclass.setup();

    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', megaclass.openSerialPort.bind(megaclass));

    const disconnectButton = document.getElementById('disconnectButton');
    disconnectButton.addEventListener('click', megaclass.disconnectSerialPort.bind(megaclass));

  }



  componentDidUpdate() {

    megaclass.readProcs();
    console.log(this.chartRef);

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
          <button id="gobutton" onClick={() => { megaclass.runLine("go") }}>Go</button>
          <button id="chartToggle" onClick={() => this.chartToggle()}>Toggle Chart</button>
          <br /><br />
          <span style={{ float: "left", marginRight: "20px" }} onClick={() => { this.showCode() }}>Code</span><span style={{ float: "left" }} onClick={() => { this.showIncludes() }}>Includes</span>
          <br />
        </div>
        <div className="interfaceGrid">
          <div className="codeEntry" id="codeEntryDiv">
            <textarea id="procs" defaultValue={`to go
something 5
end

to something :n
print :n
end`}>
            </textarea>
          </div>
          <div className="codeEntry" id="includesWrapper" style={{ display: "none" }}>
            <textarea id="includes" defaultValue={includes}
            />
          </div>
          <div className="chartArea">
            <div id="cnvframe" style={{height: "100%", width: "100%" }}>
              <canvas className="cnv" id="canvas" ></canvas>
            </div>
            <div id="chartFrame"  className="hide" style={{  height: "100%", width: "100%" }}>
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
            <textarea id="cc" onKeyDown={(e) => megaclass.handleCCKeyDown(e)} ></textarea>
          </div>
        </div>
      </div>
    );
  }
}





export default App;