import React, { Component } from 'react';
import './css/styles.css';
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
    while (true) {
      const { value, done } = await reader.read();
      if (value) {
        if(value[1] != 0){        
          var newValue = value[0] + 256 * value[1]
        } else {var newValue = value[0];
            }
        //TODO: Create output state
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
      console.log("Sending " + command)
      var message = new Uint8Array([command])
      const writer = this.outputStream.getWriter();
      writer.write(message);
      writer.releaseLock();
    }
  }

  interpretAndSend(){
    console.log("Running interpret and send");
    var command = document.getElementById("command").value;
    console.log(command);
        if(interpreter.translate(command)){
          this.sendToBoard(interpreter.translate(command));
          document.getElementById("send").value = "";
    } else {
      console.log("Command not found");
    }
   
  }

  async clickConnect() {
    await this.connectAndStartReading();
  }


  render() {
    return (
    <div>
      <header className="header">
      <h1>Web Serial</h1>
    </header>
    <div className="main">      <br />
      <button id="connectButton" type="button" >Connect</button>
      <button id="readADC" type="button" onClick={() => { this.sendToBoard(0xc0) }}>Read ADC0</button>
      <button id="dp3on" type="button" onClick={() => { this.sendToBoard(0xe3) }}>dp3on</button>
      <button id="dp3off" type="button" onClick={() => { this.sendToBoard(0xd3) }}>dp3off</button>
      <br />
      <input id="command"></input>
      <br />
      <button id="send" type="button" onClick={() => { this.interpretAndSend()}}>Send</button>
      <div id="log"></div>
    </div>
    </div>
    );
  }
}





export default App;