//Bit of a misnomer. Header also handles cloud saves. The user menu is connected to cloud loads. Oops.

import React, { useEffect, useState } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import Projects from './Projects.js';
import firebase from 'firebase/app'
import 'firebase/auth'
import { useAuth, useUser } from 'reactfire';
import axios from 'axios';
import UserMenu from './UserMenu';
import { config } from '../config';

var projects;
projects = new Projects();



function Header(props) {


    const userLogoStyle = {
        borderRadius: "50%",
        width: "35px",
        height: "35px",
        marginTop: "8px",
        backgroundColor: "#1A74A3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: "20px",
        cursor: "pointer"
    }

    const loginStyle = {
        position: "absolute",
        left: "20px",
        top: "17px",
        width: "35px",
        height: "35px",
        cursor: "pointer"
    }

    const titleStyle = {
        position: "absolute",
        left: "100px",
        lineHeight: "55px",
        verticalAling: "middle"

    }

    const titleInputStyle = {
        border: "none",
        backgroundColor: "transparent",
        color: "white",
        fontSize: "1.2em"

    }


    const { data: user } = useUser();
    const reactAuth = useAuth();


    //On mount, check to see if a project is defined in the URL.
    //All links have the format /pr${projectId}, so we check if 'pr' is the start of it and take the rest.
    //This way you can still use URLs like /settings or whatever in the future, you just can't start them with pr.

    //Currently missing: shared links will open as though they belong to you; if they don't, you have an issue. Author should
    //be displayed now on the frontend, and if it isn't you saving won't work. In the future we can look into collaborative files or something.

    useEffect(() => {
        if (window.location.pathname.substr(1) && window.location.pathname.substr(1, 2) == "pr") {
            var pid = window.location.pathname.substr(3);

            axios.get(`${config.apiUrl}/projects/${pid}`, {
            }).then(response => {
                if (response && response.data && response.data.code && response.data.title) {
                    props.updateCode(response.data.code);
                    document.getElementById('projectTitle').value = response.data.title;
                    setProjectId(response.data.projectId);
                } else {
                    console.log("error")
                }
            })
        }
    },
        [user]
    )




    //run getUserProjects if user changes; meaning, we want to wait until the login loads
    useEffect(() => {
        getUserProjects();
    },
        [user]
    );

    const [projectList, setProjectList] = useState([]);
    const [projectId, setProjectId] = useState(null);
    const [refreshUserMenu, setRefreshUserMenu] = useState(false);


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
            if (result.user) {
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

        if (user) {

            var codeToSave = document.getElementById("procs").value;
            var projectTitle = document.getElementById("projectTitle").value;


            firebase.auth().currentUser.getIdToken(false).then(idToken => {

                if (!projectId) {
                    //first time saving - we expect a response containing an ID


                    axios.post(`${config.apiUrl}/project`, {
                        userId: user.uid,
                        title: projectTitle,
                        code: codeToSave,
                        authorization: idToken
                    }).then((response) => {

                        //We're being very confident and assuming that the response is a valid ID
                        //in the future you'll want to add error handling here, or at least validation

                        setProjectId(response.data)
                    })


                } else {
                    //not the first time - update an existing

                    axios.patch(`${config.apiUrl}/project/${projectId}`, {
                        userId: user.uid,
                        title: projectTitle,
                        code: codeToSave,
                        projectId: projectId,
                        authorization: idToken
                    }).then((response) => {

                        //should validate or something ?

                    })


                }
            })

            getUserProjects();
            setRefreshUserMenu(!refreshUserMenu);
        }
    }

    const deleteProject = (pid) => {

        if (user && user.uid) {
            firebase.auth().currentUser.getIdToken(false).then(idToken => {

                axios.delete(`${config.apiUrl}/project/${pid}`, {
                    headers: {
                        authorization: idToken
                    }
                })
                    .then(response => {
                        getUserProjects();
                        setProjectId(null)
                    })
            })
        }
    }

    const handleNameChange = () => {

    }

    const getSingleProject = (pid) => {

        toggleUserMenu();
        if (user && user.uid) {
            firebase.auth().currentUser.getIdToken(false).then(idToken => {
                axios.get(`${config.apiUrl}/projects/${pid}`, {
                    headers: {
                        authorization: idToken
                    }
                }).then(response => {
                    if (response && response.data && response.data.code && response.data.title) {
                        props.updateCode(response.data.code);
                        document.getElementById('projectTitle').value = response.data.title;
                        setProjectId(response.data.projectId);
                    } else {
                        console.log("error")
                    }
                })

            })

        }
    }


    const getUserProjects = () => {

        if (user) {
            firebase.auth().currentUser.getIdToken(false).then(idToken => {

                axios.get(`${config.apiUrl}/user-projects/${user.uid}`, {
                    headers: {
                        authorization: idToken
                    }
                })
                    .then(response => {
                        //we believe that response.data is an array of projects; this should do something different if there's an error
                        setProjectList(response.data)
                    })
            })
        }
    }






    return (
        <header className="header">
            <span style={{ width: "20px" }}></span>
            {user ?
                <div onClick={toggleUserMenu} className="" style={userLogoStyle}>
                    <p>{user.displayName.substr(0, 1)}</p>
                </div>
                :
                <div style={loginStyle} >
                    <span onClick={signIn}>Login</span>
                </div>

            }
            <div style={titleStyle}>
                <input type="text" id="projectTitle" defaultValue="Untitled" style={titleInputStyle} maxLength="22" onChange={handleNameChange}></input>
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
            {user ?
                <div className="buttonDiv" onClick={() => saveToCloud()}>
                    <img src="/images/cloud-save.png" alt="Save"></img>
                    <span>Save</span>
                </div>
                :
                null
            }

            <a href="https://docs.lbym.org" target="_new">
                <div className="buttonDiv">
                    <img src="/images/new-window.png" alt="Open docs icon"></img>
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
                    <UserMenu
                        refreshUserMenu={refreshUserMenu}
                        toggleUserMenu={toggleUserMenu.bind(this)}
                        getSingleProject={getSingleProject.bind(this)}
                        deleteProject={deleteProject.bind(this)}
                        projectList={projectList}

                    />
                </div>
                :

                null
            }

        </header>
    );

}

export default Header;
