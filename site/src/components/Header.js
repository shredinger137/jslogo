/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", react-hooks/exhaustive-deps: off */

//This has turned into a bit of a mess as more authentication and project management got created and shoved in here. 
//Good practice would be to move all of the non-rendering things into helper function files (project management, user management)
//to properly isolate this. There's also a lot of prop dependency going on with UserMenu which can be moved out.


import React, { useEffect, useState } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import Projects from './Projects.js';
import firebase from 'firebase/app'
import 'firebase/auth'
import { useAuth, useUser } from 'reactfire';
import axios from 'axios';
import UserMenu from './UserMenu/UserMenu';
import { config } from '../config';

import saveIcon from '../images/cloud-save.png';
import connectIcon from '../images/connect-icon.png';
import downloadIcon from '../images/download.png';
import newWindowIcon from '../images/new-window.png';
import newProjectIcon from '../images/newProject.png';
import uploadIcon from '../images/upload.png';

import { useAppSelector } from '../redux/hooks';
import { set, clear, selectProjectId } from '../redux/reducers/projectIdSlice';
import { store } from '../redux/store';


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

    const { data: user } = useUser();
    const reactAuth = useAuth();

    const projectId = useAppSelector(selectProjectId);

    const [projectList, setProjectList] = useState([]);
    const [userMenuShow, setUserMenuShow] = useState(false);
    const [projectAuthor, setProjectAuthor] = useState(null);
    const [recoveryEntry, setRecoveryEntry] = useState(false);
    const [projectLastSaved, setProjectLastSaved] = useState(false);
    const [lastUsername, setLastUsername] = useState(null);
    const [networkError, setNetworkError] = useState(false);

    //On mount, check to see if a project is defined in the URL.
    //All links have the format /pr${projectId}, so we check if 'pr' is the start of it and take the rest.
    //This way you can still use URLs like /settings or whatever in the future, you just can't start them with pr.

    //Also start the process that will check if we're online or not.
    //store.dispatch(load(parsedFile))


    useEffect(() => {

        //get stored username if there is one
        setLastUsername(localStorage.getItem('username'));

        if (window.location.pathname.substring(1) && window.location.pathname.substring(1, 3) === "pr") {
            store.dispatch(set(window.location.pathname.substring(3)));

            axios.get(`${config.apiUrl}/projects/${window.location.pathname.substring(3)}`, {
            }).then(response => {
                if (response && response.data && response.data.code && response.data.title) {
                    props.updateCode(response.data.code);
                    document.getElementById('projectTitle').value = response.data.title;
                    store.dispatch(set(response.data.projectId));
                    setProjectAuthor(response.data.ownerDisplayName);

                } else {
                    console.log("error")
                }
            }).catch((err) => { console.log(err) })
        }
    },
        []
    )

    useEffect(() => {
        projects.writePidToStorage(projectId);
    }, [projectId])

    //run getUserProjects if user changes; meaning, we want to wait until the login loads
    //this is also where we check for recovery files
    useEffect(() => {

        //if user is logged in, save displayname and load cloud projects
        if (user && user.displayName) {
            localStorage.setItem("username", user.displayName);
            getUserProjects();
        }


        projects.getRecoverEntry().then(recoveryProject => {



            if (recoveryProject && recoveryProject[0]) {

                //if code has been saved, provide it in the menu
                if (recoveryProject[0]['code']) {
                    setRecoveryEntry(recoveryProject[0]);
                }

                //if there is a user (we don't care who at this time, but that might be a TODO) and a saved PID, open the PID
                if (user && recoveryProject[0].projectId) {
                    //This item is cleared on signing out, so it's unlikely to open someone else's project. Not impossible though.
                    getSingleProject(recoveryProject[0]['projectId']);



                }

                //if user isn't logged in and code exists, and we're not at a project URL, open recovery entry
                if (!user && recoveryProject[0]['code'] && window.location.pathname?.substr(1, 2) !== "pr") {
                    props.updateCode(recoveryProject[0]['code'])
                    props.updateCode(recoveryProject[0]['code'])
                    document.getElementById("projectTitle").value = "Recovered"
                }

                //if user is logged in, code exists, but cloud project wasn't open, load the code
                if (user && recoveryProject[0]['code'] && !recoveryProject[0]['projectId'] && window.location.pathname?.substr(1, 2) !== "pr") {
                    props.updateCode(recoveryProject[0]['code'])
                    props.updateCode(recoveryProject[0]['code'])
                    document.getElementById("projectTitle").value = "Recovered"
                }


            }
            //note: this runs on user change, which includes signing out, so it switches to 'recovery' mode. Which is a little weird.
            //Maybe TODO

        });

    },
        [user]
    );


    useEffect(() => {

        projects.initializeDatabase();

        setInterval(() => {

            let codeElement = document.getElementById('procs');
            if (codeElement != null) {
                projects.writeLastCodeToLocalStorage(codeElement.value);
            }

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
                    }).catch((err) => { console.log(err) })
                })
            }
        });
    };

    const convertDate = (dateString) => {
        if (dateString == undefined) { return false }
        let date = new Date(dateString);
        return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    }


    const saveTitle = () => {
        var projectTitle = document.getElementById("projectTitle").value;
        firebase.auth().currentUser.getIdToken(false).then(idToken => {

            if (projectId) {

                //not the first time - update an existing
                axios.patch(`${config.apiUrl}/project/${projectId}/title`, {
                    userId: user.uid,
                    title: projectTitle,
                    projectId: projectId,
                    authorization: idToken
                }).then((response) => {
                    //handle response
                    getUserProjects();
                }).catch((error) => {
                    console.log(error)
                })


            }
        })
    }

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
                        //in the future you'll want to add error handling here and validation
                        //TODO

                        setProjectLastSaved('Saved ' + convertDate(Date.now()))
                        store.dispatch(set(response.data));
                        getUserProjects();
                        window.history.pushState({}, '', `/pr${response.data}`)
                    }).catch((err) => { console.log(err); setProjectLastSaved('Error saving') })


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
                            setProjectLastSaved('Saved ' + convertDate(Date.now()))
                        } else {
                            setProjectLastSaved('Error saving')
                        }

                        getUserProjects();
                    }).catch((error) => {
                        setProjectLastSaved('Error saving');
                    })


                }
            })

        }
    }

    const deleteProject = (pid) => {

        //needs to clear the current pid

        if (user && user.uid) {
            firebase.auth().currentUser.getIdToken(false).then(idToken => {

                axios.delete(`${config.apiUrl}/project/${pid}`, {
                    headers: {
                        authorization: idToken
                    }
                })
                    .then(response =>
                    //we should check that the response is correct. TODO.
                    {
                        if (projectId == pid) {
                            store.dispatch(clear())
                            window.history.pushState({}, '', '/');
                        }

                        getUserProjects();

                    }).catch((err) => { console.log(err) })
            })
        }
    }

    const loadRecoveredCode = () => {
        if (recoveryEntry.code) {
            props.updateCode(recoveryEntry.code);
            setUserMenuShow(false);
            setRecoveryEntry(false);

        }
    }

    const getSingleProject = (openPid) => {
        projects.writePidToStorage(openPid);

        setUserMenuShow(false);

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
                        setProjectLastSaved('Saved ' + convertDate(response.data.saved) || null)
                        store.dispatch(set(response.data.projectId))
                        window.history.pushState({}, '', `/pr${response.data.projectId}`)
                        if (response.data.ownerDisplayName) {
                            setProjectAuthor(response.data.ownerDisplayName);
                        } else {
                            setProjectAuthor(null);
                        }

                    } else {
                        console.log("error")
                    }
                }).catch((err) => { console.log(err) })

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
                        if (response && response.data && Array.isArray(response.data)) {
                            setProjectList(response.data)
                        }


                    }).catch((err) => { console.log('err'); setNetworkError(true) })
            })
        }
    }




    //The render method for user:
    /*
        If user is undefined, that means it's loading; either show the lastUsername if it exists, or nothing since it's pending
        Next section: if 'user' exists, show the correct user and make the button work
        Last: if user == null or false, that means it's definitely not a signed in user, so show login. I'm not sure which falsy value it is,
        so that's why we use not undefined.

        I'm sure this could be more elegant
    
    */

    return (
        <header className="header">
            <span style={{ width: "20px" }}></span>
            {
                user === undefined && lastUsername ?

                    <div onClick={toggleUserMenu} tabIndex="0" onKeyDown={(e) => { if (e.key == "Enter") { toggleUserMenu() } }} className="" style={userLogoStyle}>
                        <p>{lastUsername.substr(0, 1)}</p>
                    </div>

                    :

                    <></>

            }


            {user ?

                <div onClick={toggleUserMenu} tabIndex="0" onKeyDown={(e) => { if (e.key == "Enter") { toggleUserMenu() } }} className="" style={userLogoStyle}>
                    <p>{user.displayName.substr(0, 1) || 'te'}</p>
                </div>

                :
                <>
                    {
                        user !== undefined ?
                            <div style={loginStyle} >
                                <span onClick={signIn} onKeyDown={(e) => { if (e.key == "Enter") { signIn() } }} tabIndex={0}>Login</span>
                            </div>
                            :
                            <></>
                    }

                </>

            }

            <span id="dummyClickToClearPid" style={{ display: 'none' }} onClick={() => { store.dispatch(clear()); setProjectLastSaved(null) }} ></span>
            <span id="dummyClickToClearAuthor" style={{ display: 'none' }} onClick={() => { setProjectAuthor(null) }}></span>
            <div style={titleStyle}>
                <input type="text" id="projectTitle" defaultValue="Untitled" style={titleInputStyle} maxLength="22" onBlur={() => { saveTitle() }}></input>
                <span style={{
                    position: "absolute",
                    left: "4px",
                    top: "1.5em",
                    fontSize: ".6em",
                    pointerEvents: 'none'
                }}>{projectAuthor && user && projectAuthor !== user.displayName ? `By ${projectAuthor}` : null}</span>
                <span style={{ fontSize: ".8em" }}>{projectLastSaved ? projectLastSaved : null}</span>
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
                <span tabIndex={0}>Upload</span>
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
                            loadRecoveredCode={loadRecoveredCode.bind(this)}
                            recoveryEntry={recoveryEntry}
                            projects={projects}
                            setUserMenuShow={setUserMenuShow}
                            setProjectLastSaved={setProjectLastSaved.bind(this)}
                            toggleUserMenu={toggleUserMenu.bind(this)}
                            getSingleProject={getSingleProject.bind(this)}
                            deleteProject={deleteProject.bind(this)}
                            projectList={projectList}
                            showMenu={userMenuShow}
                            networkError={networkError}

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
