/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", react-hooks/exhaustive-deps: off */

import React, { useState, useEffect } from 'react';
import '../css/styles.css'

//TODO: Handle ctrl + letter shortcuts from the interpreter class; consider cleaning up stuff; change print to end up here
//styling, obviously, needs some work. Make it Ubuntu like. Plenty of tutorials tell you how.
//Needs to fill the box.

function Terminal(props) {


    const [terminalEntries, setTerminalData] = useState([]);
    const [terminalSelection, setTerminalSelection] = useState(0);
    let moved = false;
    let xpos;

    useEffect(() => {
        scrollToBottom();   
        //uncomment to get a bunch of test entries in terminal
        //  document.getElementById("terminalData").innerHTML = `<span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br /><span style={{ paddingLeft: ".75rem" }}>test</span><br />`
    })

    useEffect(() => {
        getSelectedLine()
    },
        [terminalSelection]
    );

    useEffect(() => {
        document.getElementById('prompt').addEventListener('paste', function(e) {
            e.preventDefault();
            let text = (e.originalEvent || e).clipboardData.getData('text/plain').replace(/\n|\r/g, " ").substring(0, 125);
            document.execCommand("insertHTML", false, text);
        });

        //when clicking on the terminal area, focus on the prompt unless movement is detected (highlighting text)
        
        let terminalWrapper = document.getElementById('terminal-wrapper');
        const setMovedTrue = (e) => {
            if((xpos - e.offsetX) > 5 || (xpos - e.offsetX) < -5){
                moved = true;
            }

        }

        const upListener = (e) => {

            if(!moved){
                document.getElementById('prompt').focus();
            } else {
                moved = false;
            }
            terminalWrapper.removeEventListener('mousemove', setMovedTrue);
            terminalWrapper.removeEventListener('mouseup', upListener);
        }

        terminalWrapper.addEventListener('mousedown', function(e) {
            xpos = e.offsetX;
            terminalWrapper.addEventListener('mousemove', setMovedTrue);
            terminalWrapper.addEventListener('mouseup', upListener);
        })

    }, [])


    function handleEnter() {

        var inputValue = document.getElementById("prompt").innerText;
        setTerminalSelection(0);
        props.interpreter.runLine(inputValue);
        var newData = [...terminalEntries];
        newData.push(inputValue);
        document.getElementById("terminalData").innerHTML += `<span style= paddingLeft: ".75rem">${inputValue}</span>`;
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
        overflowX: "none",
        fontFamily: "'Courier New', monospace",
        marginBottom: "10px",
        zIndex: 1,

    }

    function getSelectedLine() {
        var entries = [...terminalEntries];
        entries.reverse();

        //there is an occasional off by one error happening; it's probably here
        if (terminalSelection > 0 && terminalSelection <= entries.length) {
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
            
            className="terminal" 
            style={{ border: "solid", outline: "none", zIndex: "1", backgroundColor: "white" }} 
            >

            <div id="terminalData" style={divStyle}> </div>
            <span></span><span id="prompt" contentEditable={true} style={{ outline: "none", width: "100%", cursor: "text" }} onKeyDown={(e) => { handleKeyDown(e) }}></span>
            <p></p>
            <textarea id="cc" style={{ display: "none" }}></textarea>
        </div>
    )

}

export default Terminal;