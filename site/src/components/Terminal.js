/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */
 // eslint-disable-next-line react-hooks/exhaustive-deps

import React, { useState, useEffect } from 'react';

//TODO: Handle ctrl + letter shortcuts from the interpreter class; consider cleaning up stuff; change print to end up here
//styling, obviously, needs some work. Make it Ubuntu like. Plenty of tutorials tell you how.
//Needs to fill the box.

function Terminal(props) {


    const [terminalEntries, setTerminalData] = useState([]);
    const [terminalSelection, setTerminalSelection] = useState(0);

    useEffect(() => {
        scrollToBottom();
        //uncomment to get a bunch of test entries in terminal
        //  document.getElementById("terminalData").innerHTML = `<span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br />`
    })

    //TODO: This is where we want to handle the change in selection. Also, 0 is not meaningful right now, so we need to offset the result by one.

    useEffect(() => {
        getSelectedLine()
    },
        [terminalSelection]
    );


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

    function scrollToBottom() {
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

    function getSelectedLine() {
        var entries = [...terminalEntries];
        entries.reverse();

        if (terminalSelection - 1 > -1 && terminalSelection - 1 <= entries.length) {
            var selectedEntry = entries[terminalSelection - 1];
            if (selectedEntry) {
                document.getElementById("prompt").innerHTML = selectedEntry;
            }
        } else if(terminalSelection - 1 < 0){
            document.getElementById("prompt").innerHTML = "";
            setTerminalSelection(0);
        }
    }

    function handleKeyDown(e) {


        if (e.key == "Enter") {
            e.preventDefault();
            handleEnter();
            return;
        }

        if (e.key == "ArrowUp") {
            e.preventDefault();
            if(terminalSelection < terminalEntries.length){
                setTerminalSelection(terminalSelection + 1);
            }

            return;
        }

        if (e.key == "ArrowDown") {
            e.preventDefault();
            setTerminalSelection(terminalSelection - 1);
            return;
        }
        
        if (e.key == "Escape"){
            e.preventDefault();
            setTerminalSelection(0);
            return;
        }

        scrollToBottom();
        return;
    }

    //Note: the CC textarea isn't being used, but is referenced in 'interpreter'; keeping it here to prevent side effects of it not existing


    return (
        <div 
            tabIndex="0" 
            id="terminal-wrapper" 
            onClick={() => { document.getElementById('prompt').focus() }} 
            className="terminal" 
            style={{ border: "solid", outline: "none", maxHeight: "25vh", zIndex: "1", backgroundColor: "white" }} 
            >

            <div id="terminalData" style={divStyle}> </div>
            <span>></span><span id="prompt" contentEditable={true} style={{ outline: "none", width: "100%" }} onKeyDown={(e) => { handleKeyDown(e) }}></span>
            <p></p>
            <textarea id="cc" style={{ display: "none" }}></textarea>
        </div>
    )

}

export default Terminal;