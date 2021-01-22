import React, { useState, useEffect } from 'react';

//TODO: Handle ctrl + letter shortcuts from the interpreter class; consider cleaning up stuff; change print to end up here
//styling, obviously, needs some work. Make it Ubuntu like. Plenty of tutorials tell you how.
//Needs to fill the box.

function Terminal(props) {

    useEffect(() => {
        scrollToBottom()
    })
    
    const [terminalData, setTerminalData] = useState(["test", "test2", "test", "test2", "test", "test2", "test", "test2", "test", "test2", "test", "test2"]);

    function handleEnter() {

        var inputValue = document.getElementById("prompt").innerHTML;
        var newData = [...terminalData];
        newData.push(inputValue);
        setTerminalData(newData)
        document.getElementById("prompt").innerHTML = "";
        props.interpreter.runLine(inputValue);
        scrollToBottom();
    }

    function scrollToBottom(){
        document.getElementById("data").scrollTop = document.getElementById("data").scrollHeight;
    }

    const divStyle = {
        height: "100%",
        width: "100%",
        overflowY: "scroll",
        fontFamily: "'Courier New', monospace"
    }

    function handleKeyDown(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            handleEnter();
        } 
    
        if (e.key == "UpArrow") {
            console.log("upArrow");
        }

        scrollToBottom();

    }


    return (
        <div tabIndex="0" id="divThing" onClick={() => { document.getElementById('prompt').focus() }} className="terminal" style={{outline: "none", maxHeight: "25vh", zIndex: "1"}} id="terminal-new">
            <div id="data" style={divStyle}>
                {terminalData.map(line => (
                    <>
                        <span style={{ paddingLeft: ".75rem" }}>{line}</span>
                        <br />
                    </>
                ))}

                <span>></span><span id="prompt" contentEditable={true} style={{ outline: "none", width: "100%" }} onKeyPress={(e) => { handleKeyDown(e) }}></span>
                <div style={{height: "20px"}}></div>
            </div>

        </div>
    )

}

export default Terminal;