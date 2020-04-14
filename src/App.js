import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import Interpreter from './components/Interpreter';
var interpreter = new Interpreter();

let port;
let reader;
let outputStream;

class App extends Component {



  componentDidMount(){
    const connectButton = document.getElementById('connectButton');
    const log = document.getElementById('log');
    const dp3on = document.getElementById('dp3on');
    const dp3off = document.getElementById('dp3off');
    const readADC = document.getElementById('readADC');
    this.sendToBoard = this.sendToBoard.bind(this);
    this.readLoop = this.readLoop.bind(this);
    this.connectAndStartReading = this.connectAndStartReading.bind(this);
    this.interpretAndSend = this.interpretAndSend.bind(this);
    connectButton.addEventListener('click', this.connectAndStartReading);


  }

  componentDidUpdate(){

  }

  checkIfSerialCapable = () => {
    if ('serial' in navigator) {
      console.log("serial")
      return true;
    } else 
      { 
        console.log("not serial");
        return false 
      }
  }

  async connectAndStartReading() {
    port = await navigator.serial.requestPort();
    await port.open({ baudrate: 115200 });
    reader = port.readable.getReader();
    this.readLoop();
    this.outputStream = port.writable;
  }


  async readLoop() {
    var terminal = document.getElementById("terminalTextbox");
    while (true) {
      const { value, done } = await reader.read();
      if (value) {
        if(value[1] != 0){        
          var newValue = value[0] + 256 * value[1]
        } else {var newValue = value[0];
            }
      terminal.value += "\n>" + newValue + "\n";

        console.log(newValue);
      }
      if (done) {
        reader.releaseLock();
        break;
      }
    }
  }

  sendToBoard(command){
    console.log("Send triggered");
    if(this.outputStream)
    {
      var message = new Uint8Array([command])
      const writer = this.outputStream.getWriter();
      writer.write(message);
      writer.releaseLock();
    }
  }

  interpretAndSend(command){
    console.log(command);
        if(interpreter.translate(command)){
          this.sendToBoard(interpreter.translate(command));

    } else {
      console.log("Command not found");
    }
   
  }

  async clickConnect() {
    await this.connectAndStartReading();
  }

  handleTerminalEntry(e){
    if(e && e.keyCode === 13){
      var terminalAllContent = document.getElementById("terminalTextbox").value.split('\n').reverse();
      var terminalLastLine = terminalAllContent[0];
      this.interpretAndSend(terminalLastLine);
      //TODO: get the entered line and submit to interpreter
    }
  }

  render() {
    return (
    <div>
      <header className="header">
      <h1>LbyM: Web Serial</h1>
    </header>
    <div className="main">      <br />
    <p>Click 'connect' to start, then select the Arduino device. After that you can use the below buttons, or enter commands in the terminal (bottom right).
      <br /><br />
      This'll get some sort of menu at the top. The buttons might go away, but should be replaced with hints on how to get started. A button should be added for the code entry area to 'run'. 
      Run will come pre-defined as a boilerplate.
      <br /><br />
      As of this writing the interpreter will control LEDs and read ADCs. LOGO logic has not been implemented.
    </p>
      <button id="connectButton" type="button" >Connect</button>
      <button id="readADC" type="button" onClick={() => { this.sendToBoard(0xc0) }}>Read ADC0</button>
      <button id="dp3on" type="button" onClick={() => { this.sendToBoard(0xe3) }}>dp3on</button>
      <button id="dp3off" type="button" onClick={() => { this.sendToBoard(0xd3) }}>dp3off</button>
      <br />
      <br />
      <br />
    </div>
      <div className = "interfaceGrid">
        <div className = "codeEntry" >
          <textarea id="codeEntryTextbox" value="This will be a code entry/file editing area"></textarea></div>
        <div className = "chartArea"><p>This will be a chart area.</p></div>
        <div className = "terminal">
          <textarea id="terminalTextbox" onKeyDown={this.handleTerminalEntry.bind(this)} ></textarea>
        </div>
      </div>
    </div>
    );
  }
}





export default App;