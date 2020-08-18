import React, { Component } from 'react';
import './css/styles.css';
import './css/layout.css';
import Megaclass from './components/megaclass';
//import Comms from './components/Comms';
import Interpreter from './components/Interpreter';


var megaclass;
var interpreter = new Interpreter();



let port;
let reader;

class App extends Component {

//In this version, the classes 'procedures' and 'logo' are accessible in the global space by using
//window.logo, window.procedures. Others should be added in index.html by the same method.

//This only sort of works.

//This is a placeholder. The most correct way to do this is to disentangle the classes and make them into
//components. The problem is that the classes are not self contained as written. They have to be turned into
//self contained components and cleaned up to be readable. This might take a while.


  componentDidMount(){
    megaclass = new Megaclass();
    megaclass.setuptl();
    megaclass.setup();

    
    this.sendToBoard = this.sendToBoard.bind(this);
    this.readLoop = this.readLoop.bind(this);
    this.connectAndStartReading = this.connectAndStartReading.bind(this);
    this.interpretAndSend = this.interpretAndSend.bind(this);

    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', megaclass.openSerialPort.bind(megaclass));
    this.testProcRead("5 + 3");
    
  }

  testProcRead(string){
    
  }

  componentDidUpdate(){

    megaclass.readProcs();

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
      var terminalAllContent = document.getElementById("cc").value.split('\n').reverse();
      var terminalLastLine = terminalAllContent[0];
      this.interpretAndSend(terminalLastLine);

    }
  }



  render() {
    return (
    <div>
      <header className="header">
      <h1>Learning by Making</h1>
    </header>
    <div className="main">      <br />
    <p>Click 'connect' to start, then select the Arduino device. After that you can use the below buttons, or enter commands in the terminal (bottom right). Defining a 'go' word allows you to run
      things by clicking 'go'. Note that this only works in Chrome.
      <br />
    </p>
      <button id="connectButton" type="button" >Connect</button>
      <button id="readADC" type="button" onClick={() => { this.sendToBoard(0xc0) }}>Read ADC0</button>
      <button id="dp3on" type="button" onClick={() => { this.sendToBoard(0xe3) }}>dp3on</button>
      <button id="dp3off" type="button" onClick={() => { this.sendToBoard(0xd3) }}>dp3off</button>
      <button id="gobutton" onClick={() => {megaclass.runLine("go")}}>Go</button>
      <br />
      <br />
      <br />
    </div>
      <div className = "interfaceGrid">
        <div className = "codeEntry" >
          <textarea id="procs" defaultValue={`to go
print 5
end`}></textarea></div>
        <div className = "chartArea" id = "cnvframe">
          <canvas className="cnv" id="canvas"></canvas>
        </div>
        <div className = "terminal">
          <textarea id="cc" onKeyDown={(e) => megaclass.handleCCKeyDown(e)} ></textarea>
        </div>
      </div>
    </div>
    );
  }
}





export default App;