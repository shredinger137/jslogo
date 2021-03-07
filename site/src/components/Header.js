import React, { useEffect } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import Projects from './Projects.js';
import firebase from 'firebase/app'
import 'firebase/auth'
import { useAuth, useUser } from 'reactfire';
import axios from 'axios';
import UserMenu from './UserMenu';
import {config} from '../config';

var projects;
projects = new Projects();



function Header(props) {

    const userLogoStyle = {
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        marginTop: "8px",
        backgroundColor: "darkblue",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: "20px",
        cursor: "pointer"
    }

    const titleStyle = {
        position: "absolute",
        left: "100px",
        lineHeight: "55px",
        verticalAling: "middle"
        
    }


    useEffect(() => {
        if (window.isUpdateAvailable) {
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

    const toggleUserMenu = () => {
        var menu = document.getElementById("userMenuWrapper");
        menu.classList.toggle("userMenuShow");
    }


    const signIn = async () => {
        await reactAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(result => {
            if(result.user){
                firebase.auth().currentUser.getIdToken(false).then(idToken => {
                    axios.post(`${config.apiUrl}/login/${result.user.uid}`, {
                        displayName: result.user.displayName,
                        email: result.user.email,
                        authorization: idToken
                    })
                })
            }
        });
    };


    const saveToCloud = () => {
        firebase.auth().currentUser.getIdToken(false).then(idToken => {
            //this doesn't do anything - we need an ID flag for each project, and we have to... generate an ID? Otherwise how do we understand that the name changed?

            //I guess load project can handle updating the flags, so if an ID doesn't exist we assume there isn't one and we're creating a new project.

            //Okay. So make an endpoint to create a new project and have it get hit by this. Then update App to feature a project ID.... and use the URL to store it? Not sure yet.

            //Then we'll have the function check. It's either creating a new one or updating an existing one. Maybe.

        })
    }


    return (
        <header className="header">
            <span style={{ width: "20px" }}></span>
            {user ?
                <div onClick={toggleUserMenu} className="" style={userLogoStyle}>
                    <p>{user.displayName.substr(0, 1)}</p>
                </div>
                :
                <div className="buttonDiv" >
                    <span onClick={signIn}>Login</span>
                </div>

            }
            <div style={titleStyle}>
                <span id="projectTitle" contentEditable>Untitled</span>
            </div>
            <div className="buttonDiv" onClick={() => toggleNewProject()}>
                <img src="/images/newProject.png" alt="New project icon"></img>
                <span>New</span>
            </div>
            <div className="buttonDiv" onClick={() => saveAs()}>
                <img src="/images/download.png" alt="Download icon"></img>
                <span>Download</span>
            </div>
            <div className="buttonDiv" onClick={() => loadFile()}>
                <img src="/images/upload.png" alt="Upload icon"></img>
                <span>Open</span>
            </div>
            <a href="https://docs.lbym.org" target="_new">
                <div className="buttonDiv">
                    <span>Docs</span>
                </div>
            </a>
            <div id="connectButton" className="buttonDiv" >
                <img src="/images/connect-icon.png" alt="Connect icon"></img>
                <span>Connect</span>
            </div>
            <div id="disconnectButton" className="buttonDiv" style={{ display: "none" }}>
                <img src="/images/connect-icon.png" alt="Connect icon"></img>
                <span>Disconnect</span>
            </div>
            <span style={{ width: "20px" }}></span>

            {user ?
                <div id="userMenuWrapper" className="userMenu">
                    <UserMenu toggleUserMenu = {toggleUserMenu.bind(this)} />
                </div>
                :
                null
            }

        </header>
    );

}

export default Header;
