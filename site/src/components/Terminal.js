import React, { useState, useEffect } from 'react';

//TODO: Handle ctrl + letter shortcuts from the interpreter class; consider cleaning up stuff; change print to end up here
//styling, obviously, needs some work. Make it Ubuntu like. Plenty of tutorials tell you how.
//Needs to fill the box.

function Terminal(props) {

    useEffect(() => {
        scrollToBottom();
        //uncomment to get a bunch of test entries in terminal
        //  document.getElementById("terminalData").innerHTML = `<span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br />`
    })
    
    const [terminalEntries, setTerminalData] = useState([]);
    const [terminalSelection, setTerminalSelection] = useState(0);

    function handleEnter() {

        var inputValue = document.getElementById("prompt").innerHTML;
        props.interpreter.runLine(inputValue);
        var newData = [...terminalEntries];
        newData.push(inputValue);
        document.getElementById("terminalData").innerHTML += `<span style={{ paddingLeft: ".75rem" }}>${inputValue}</span><br />`;
        setTerminalData(newData)
    
        document.getElementById("prompt").innerHTML = "";

        scrollToBottom();
    }

    function scrollToBottom(){
        document.getElementById("terminalData").scrollTop = document.getElementById("terminalData").scrollHeight;
    }

    const divStyle = {
        height: "calc(100% - 30px)",
        width: "100%",
        overflowY: "scroll",
        fontFamily: "'Courier New', monospace",
        marginBottom: "10px",
        zIndex: 1,

    }

    function handleKeyDown(e) {
        
        if (e.key == "Enter") {
            e.preventDefault();
            handleEnter();
            
        } 
    
        if (e.key == "ArrowUp") {
            e.preventDefault();
            setTerminalSelection(terminalSelection + 1);
            var entries = [...terminalEntries];
            entries.reverse();
            var selectedEntry = entries[terminalSelection];
            if(selectedEntry){
                document.getElementById("prompt").innerHTML = selectedEntry;
            }

           
        } else {
            setTerminalSelection(0);
        }

        scrollToBottom();

    }

    //Note: the CC textarea isn't being used, but is referenced in 'interpreter'; keeping it here to prevent side effects of it not existing


    return (
        <div tabIndex="0" id="terminal-wrapper" onClick={() => { document.getElementById('prompt').focus() }} className="terminal" style={{ border: "solid", outline: "none", maxHeight: "25vh", zIndex: "1", backgroundColor: "white"}} id="terminal-new">
            <div id="terminalData" style={divStyle}> </div>
                <span>></span><span id="prompt" contentEditable={true} style={{ outline: "none", width: "100%" }} onKeyDown = {(e) => { handleKeyDown(e) }}></span>           
        <textarea id="cc" style={{display: "none"}}></textarea>
        </div>
    )

}

export default Terminal;