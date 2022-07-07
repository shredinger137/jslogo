/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", react-hooks/exhaustive-deps: off */

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

import saveIcon from '../images/cloud-save.png';
import connectIcon from '../images/connect-icon.png';
import downloadIcon from '../images/download.png';
import newWindowIcon from '../images/new-window.png';
import newProjectIcon from '../images/newProject.png';
import uploadIcon from '../images/upload.png';




//alright, latest issue is using 'user' in different ways. Stick to one.

function Header(props) {

    var projects;
    projects = new Projects();

    const userLogoStyle = {
        zIndex: 2,
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

    //TODO: Validating log in is rather slow
    //consider using the native firebase stuff

    const { data: user } = useUser();
    const reactAuth = useAuth();




    //in progress: change toggleUserMenu to use this state instead

    const [projectList, setProjectList] = useState([]);
    const [saveState, setSaveState] = useState("");
    const [projectId, setProjectId] = useState(null);
    const [userMenuShow, setUserMenuShow] = useState(false);
    const [projectAuthor, setProjectAuthor] = useState(null);

    //On mount, check to see if a project is defined in the URL.
    //All links have the format /pr${projectId}, so we check if 'pr' is the start of it and take the rest.
    //This way you can still use URLs like /settings or whatever in the future, you just can't start them with pr.

    //Also start the process that will check if we're online or not.


    useEffect(() => {


        if (window.location.pathname.substring(1) && window.location.pathname.substring(1, 3) === "pr") {
            setProjectId(window.location.pathname.substring(3));


            axios.get(`${config.apiUrl}/projects/${window.location.pathname.substring(3)}`, {
            }).then(response => {
                if (response && response.data && response.data.code && response.data.title) {
                    props.updateCode(response.data.code);
                    document.getElementById('projectTitle').value = response.data.title;
                    setProjectId(response.data.projectId);
                    setProjectAuthor(response.data.ownerDisplayName);

                } else {
                    console.log("error")
                }
            })
        }
    },
        []
    )

    //run getUserProjects if user changes; meaning, we want to wait until the login loads
    useEffect(() => {

        getUserProjects();
        projects.getRecoverEntry().then(recoveryProject => {

            //make sure we're not at a project URL
            if (!window.location.pathname.substr(1) || window.location.pathname.substr(1, 2) !== "pr") {
                if (recoveryProject && recoveryProject[0]) {
                    //if there is a user (we don't care who at this time, but that might be a TODO) and a saved PID, open the PID
                    if (user && recoveryProject[0].projectId) {
                        //This item is cleared on signing out, so it's unlikely to open someone else's project. Not impossible though.
                        getSingleProject(recoveryProject[0]['projectId']);
                    }

                    if (recoveryProject[0]['code']) {
                        props.updateCode(recoveryProject[0]['code'])
                        props.updateCode(recoveryProject[0]['code'])
                        document.getElementById("projectTitle").value = "Recovered"
                    }
                }
                    //note: this runs on user change, which includes signing out, so it switches to 'recovery' mode. Which is a little weird.
                    //Maybe TODO - add a transition listener of some sort?
            }
        });

    },
        [user]
    );


    useEffect(() => {

        projects.initializeDatabase();

        /*
        This is how we should handle opening the previous project, if we choose to do that 
        firebase.auth().onAuthStateChanged(function (user) {
            projects.getRecoverEntry().then(recoveryProject => {
                console.log(recoveryProject)
                console.log(user)
                if (user && recoveryProject[0] && recoveryProject[0].projectId) {
                    console.log("open" + recoveryProject[0].projectId)
                    getSingleProject(recoveryProject[0].projectId, user);
                } else if (recoveryProject[0].code) {
                    //restore code
                }
            }


            )
        });

        */




        setInterval(() => {

            projects.writeLastCodeToLocalStorage(document.getElementById("procs").value);
        }, 1000);


    },
        [],
    )

    function loadFile() {
        document.getElementById("load").click();
        document.getElementById("procs").focus();
    }

    function saveAs() {
        projects.saveAs(document.getElementById("projectTitle").value);
    }

    function toggleNewProject() {
        props.toggleNewProjectModal();
    }

    const toggleUserMenu = () => {

        setUserMenuShow(!userMenuShow)

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
                        //TODO

                        //TODO: We're lifting up state instead of keeping it here, but there will be 
                        //repetition until this is done.
                        props.setProjectId(response.data);
                        setProjectId(response.data);;
                        getUserProjects();
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

                        if (response.status == 200) {
                            setSaveState("Project Saved");
                        } else {
                            setSaveState("Error Saving")
                        }

                        setTimeout(function () {
                            setSaveState("");
                        }, 3000);

                        getUserProjects();
                    })


                }
            })

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
                    })
            })
        }
    }


    const getSingleProject = (openPid) => {

        projects.writePidToStorage(openPid);

        toggleUserMenu();

        if (true
            //user && user.uid - check temporarily disabled
        ) {

            firebase.auth().currentUser.getIdToken(false).then(idToken => {
                axios.get(`${config.apiUrl}/projects/${openPid}`, {
                    headers: {
                        authorization: idToken
                    }
                }).then(response => {
                    if (response && response.data && response.data.code && response.data.title) {
                        props.updateCode(response.data.code);
                        var titleElement = document.getElementById('projectTitle');
                        if (titleElement !== null) {
                            titleElement.value = response.data.title;
                        }
                        setProjectId(response.data.projectId);
                        props.setProjectId(response.data.projectId);
                        if (response.data.ownerDisplayName) {
                            setProjectAuthor(response.data.ownerDisplayName);
                        } else {
                            setProjectAuthor(null);
                        }

                    } else {
                        console.log("error")
                    }
                })

            })

        } else {
            console.log("conditional error")
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
                        if (response && response.data && Array.isArray(response.data)) {

                            setProjectList(response.data)
                        }


                    })
            })
        }
    }






    return (
        <header className="header">
            <span style={{ width: "20px" }}></span>
            {user && user.displayName ?
                <div onClick={toggleUserMenu} tabIndex="0" onKeyDown={(e) => { if (e.key == "Enter") { toggleUserMenu() } }} className="" style={userLogoStyle}>
                    <p>{user.displayName.substr(0, 1)}</p>
                </div>
                :
                <div style={loginStyle} >
                    <span onClick={signIn} onKeyDown={(e) => { if (e.key == "Enter") { signIn() } }} tabIndex={0}>Login</span>
                </div>

            }

            <span id="dummyClickToClearPid" style={{ display: 'none' }} onClick={() => { setProjectId(null) }} ></span>
            <span id="dummyClickToClearAuthor" style={{ display: 'none' }} onClick={() => { setProjectAuthor(null) }}></span>
            <div style={titleStyle}>
                <input type="text" id="projectTitle" defaultValue="Untitled" style={titleInputStyle} maxLength="22"></input>
                <span style={{
                    position: "absolute",
                    left: "4px",
                    top: "1.5em",
                    fontSize: ".6em",
                    pointerEvents: 'none'
                }}>{projectAuthor && user && projectAuthor !== user.displayName ? `By ${projectAuthor}` : null}</span>
                <span style={{ fontSize: ".8em" }}>{saveState}</span>
            </div>

            <div className="buttonDiv" onClick={() => toggleNewProject()} onKeyDown={(e) => { if (e.key == "Enter") { toggleNewProject() } }}>
                <img src={newProjectIcon} alt="New project icon"></img>
                <span tabIndex={0}>New</span>
            </div>
            <div className="buttonDiv" onClick={() => saveAs()} onKeyDown={(e) => { if (e.key == "Enter") { saveAs() } }}>
                <img src={downloadIcon} alt="Download icon"></img>
                <span tabIndex={0}>Download</span>
            </div>
            <div className="buttonDiv" onClick={() => loadFile()} onKeyDown={(e) => { if (e.key == "Enter") { loadFile() } }}>
                <img src={uploadIcon} alt="Upload icon"></img>
                <span tabIndex={0}>Open</span>
            </div>
            <div tabIndex={0} className={user ? "buttonDiv" : "buttonDiv disabled"}
                onClick={() => saveToCloud()} onKeyDown={(e) => { if (e.key == "Enter") { saveToCloud() } }}>
                <img src={saveIcon} alt="Save"></img>
                <span>Save</span>
            </div>
            <a href="https://docs.lbym.org" target="_new">
                <div className="buttonDiv">
                    <img src={newWindowIcon} alt="Open docs icon"></img>
                    <span>Docs</span>
                </div>
            </a>
            <div id="connectButton" className="buttonDiv" >
                <img src={connectIcon} alt="Connect icon"></img>
                <span tabIndex={0}>Connect</span>
            </div>
            <div id="disconnectButton" className="buttonDiv" style={{ display: "none" }}>
                <img src={connectIcon} alt="Connect icon"></img>
                <span tabIndex={0}>Disconnect</span>
            </div>
            <span style={{ width: "20px" }}></span>

            {user ?
                <>
                    <div id="fullPage" className={userMenuShow ? "fullPage" : null} onClick={(e) => { setUserMenuShow(false) }}></div>
                    <div id="userMenuWrapper" className={userMenuShow ? "userMenu userMenuShow" : "userMenu"} onClick={(e) => { e.stopPropagation() }} tabIndex={0}>

                        <UserMenu
                            projects={projects}
                            toggleUserMenu={toggleUserMenu.bind(this)}
                            getSingleProject={getSingleProject.bind(this)}
                            deleteProject={deleteProject.bind(this)}
                            projectList={projectList}
                            showMenu={userMenuShow}

                        />
                    </div>
                </>
                :

                null
            }

        </header>
    );

}

export default Header;
