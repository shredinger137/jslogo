import React, { useEffect } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import Projects from './Projects.js';
import firebase from 'firebase';
import 'firebase/auth'
import { useFirebaseApp, useAuth, useUser } from 'reactfire';

var projects;
projects = new Projects();



function Header(props) {

    useEffect(() => {
        if(window.isUpdateAvailable){
            document.getElementById("updateText").style.visibility = "visible";
        }
      });

    const { data: user } = useUser();
    const reactAuth = useAuth();

    function loadFile() {
        document.getElementById("load").click();
        document.getElementById("procs").focus();
    }

    function saveAs() {
        projects.saveAs();
    }

    function toggleNewProject() {
        props.toggleNewProjectModal();
    }

    const signOut = () => {
        firebase.auth().signOut();
      }


    const signIn = async () => {
        await reactAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      };


    return (
        <header className="header">
            <span style={{ width: "10px" }}></span>

            <div className="buttonDiv" onClick={() => toggleNewProject()}>
                <img src="/images/newProject.png"></img>
                <span>New Project</span>
            </div>
            <div className="buttonDiv" onClick={() => saveAs()}>
                <img src="/images/download.png"></img>
                <span>Save File</span>
            </div>
            <div className="buttonDiv" onClick={() => loadFile()}>
                <img src="/images/upload.png"></img>
                <span>Load File</span>
            </div>
            <a href="https://docs.lbym.org" target="_new">
                <div className="buttonDiv">
                    <span>Docs</span>
                </div>
            </a>
            <div id="connectButton" className="buttonDiv" style={{ minWidth: "100px", position: "fixed", right: "50px" }}>
                <img src="/images/connect-icon.png"></img>
                <span>Connect</span>
            </div>
            <div id="disconnectButton" className="buttonDiv" style={{ display: "none", position: "fixed", right: "50px" }}>
                <img src="/images/connect-icon.png"></img>
                <span>Disconnect</span>
            </div>
            <span style={{ width: "10px" }}></span>
            {user ?
                <div className="buttonDiv">
                    <span onClick={signOut}>Logout</span>
                </div>
                :
                <div className="buttonDiv">
                    <span onClick={signIn}>Login</span>
                </div>

            }
            <div id="updateText" style={{marginLeft: "200px", fontSize: ".8rem", marginTop: "20px", visibility: "hidden"}}><span>An update is available. Close and re-open the site to apply it.</span></div>

        </header>
    );

}

export default Header;
