import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import Megaclass from './components/megaclass';
import { Scatter } from 'react-chartjs-2';

var megaclass;

class App extends Component {

  constructor(props) {
    super(props);
    this.chartReference = React.createRef();
  }

  chartRef = {}
  state = {
    canvasHeight: 400,
    canvasWidth: 900,
    showChartFrame: false,
    chartData:
      [
      ],
  };


  componentDidMount() {

    var canvasHeight = document.getElementById("cnvframe").clientHeight;
    var canvasWidth = document.getElementById("cnvframe").clientWidth;

    this.setState({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth
    });


    megaclass = new Megaclass(document.getElementById("cnvframe").offsetHeight, document.getElementById("cnvframe").offsetWidth, this.addToChart.bind(this));
    megaclass.setuptl();
    megaclass.setup();

    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', megaclass.openSerialPort.bind(megaclass));

    const disconnectButton = document.getElementById('disconnectButton');
    disconnectButton.addEventListener('click', megaclass.disconnectSerialPort.bind(megaclass));


    console.log(this.state);
  }



  componentDidUpdate() {

    megaclass.readProcs();
    console.log(this.chartRef);

  }

  addToChart(x, y) {
    var newData = this.state.chartData;
    newData.push({ x: x, y: y });
    this.setState({ chartData: newData });
    //console.log(x + y);
    console.log(newData);
    //console.log(this.state.chartData);

  }

  checkIfSerialCapable = () => {
    if ('serial' in navigator) {
      console.log("serial")
      return true;
    } else {
      console.log("not serial");
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
    var chartFrame = document.getElementById("chartFrame");
    var turtleFrame = document.getElementById("cnvframe");

    if (this.state.showChartFrame) {
      chartFrame.style.display = "none";
      turtleFrame.style.display = "block";
      this.setState({ showChartFrame: false });
    } else {
      chartFrame.style.display = "block";
      turtleFrame.style.display = "none";
      this.setState({ showChartFrame: true });
    }

  }



  render() {
    return (
      <div>
        <header className="header">
          <h1>Learning by Making</h1>
        </header>
        <div className="main">
          <p>Click 'connect' to start, then select the Arduino device. Defining a 'go' word allows you to run
          things by clicking 'go', or you can use the terminal at the bottom. Use dp3on to turn on pin 3, read0 to read the sensor on A0. Requires Chrome. The chart can be updated with chartpush x y, but doesn't take data by time yet.
      <br />
          </p>
          <button id="connectButton" type="button" >Connect</button>
          <button id="disconnectButton" type="button" style={{ display: "none" }}>Disconnect</button>
          <button id="gobutton" onClick={() => { megaclass.runLine("go") }}>Go</button>
          <button id="chartToggle" onClick={() => this.chartToggle()}>Toggle Chart</button>
          <br />
          <br />
        </div>
        <div className="interfaceGrid">
          <div className="codeEntry" >
            <textarea id="procs" defaultValue={`to go
print 5
end`}></textarea></div>
          <div className="chartArea" id="cnvframe">
            <canvas className="cnv" id="canvas"></canvas>
          </div>
          <div className="chartArea" id="chartFrame" style={{ display: "none" }}>
            <div id="chartWrapper" style={{ height: this.state.canvasHeight, width: this.state.canvasWidth }}>
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
                width={200}
                height={this.state.canvasHeight / 2}
                options={{
                  maintainAspectRatio: false,
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
          <div className="terminal">
            <textarea id="cc" onKeyDown={(e) => megaclass.handleCCKeyDown(e)} ></textarea>
          </div>
        </div>
      </div>
    );
  }
}





export default App;