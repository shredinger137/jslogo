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


    const { data: user } = useUser();
    const reactAuth = useAuth();


    //in progress: change toggleUserMenu to use this state instead

    const [projectList, setProjectList] = useState([]);
    const [refreshUserMenu, setRefreshUserMenu] = useState(false);
    const [saveState, setSaveState] = useState("");
    const [projectId, setProjectId] = useState(null);
    const [userMenuShow, setUserMenuShow] = useState(false);
    const [projectAuthor, setProjectAuthor] = useState(null);


    //On mount, check to see if a project is defined in the URL.
    //All links have the format /pr${projectId}, so we check if 'pr' is the start of it and take the rest.
    //This way you can still use URLs like /settings or whatever in the future, you just can't start them with pr.


    useEffect(() => {
        if (window.location.pathname.substr(1) && window.location.pathname.substr(1, 2) === "pr") {
            setProjectId(window.location.pathname.substr(3));

            axios.get(`${config.apiUrl}/projects/${window.location.pathname.substr(3)}`, {
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



        projects.getRecoverEntry().then(recoveryProject => {
            if (!window.location.pathname.substr(1) || window.location.pathname.substr(1, 2) !== "pr") {
                if (recoveryProject && recoveryProject[0] && recoveryProject[0]['code']) {
                    props.updateCode(recoveryProject[0]['code'])
                    props.updateCode(recoveryProject[0]['code'])
                    document.getElementById("projectTitle").value = "Recovered"

                    if (false) {
                        console.log("project")
                        //this is not a robust solution - it assumes that we're connected, that the correct user is the one on the computer,
                        //and that we get a good response and don't need to fallback to code. Obviously all of that is wrong and we 
                        //need to be more robust in the future.
                        getSingleProject(recoveryProject[0]['projectId']);
                    } else {

                        props.updateCode(recoveryProject[0]['code'])

                        document.getElementById("projectTitle").value = "Recovered"
                    }
                }


                //this is a little weird with cloud saves; we're just going to change the title to 'recovered', and hope that makes it clear
                //the problem is if you go in and it already has the project you were working on you might not realize it's different

            }
        });

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

                        setProjectId(response.data);;
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
                    })
            })
        }
    }


    const getSingleProject = (openPid, userObject) => {
        //during this process we're passing userObject when getting it from a recovery entry, since it's unreliable to get it through state unless state triggers the function
        //this is an issue entirely because we're using two different methods of getting user, and it might not exist in both... so... think about that.

        projects.writePidToStorage(openPid);

        toggleUserMenu();

        if (true
            //user && user.uid - check temporarily disabled during troubleshooting
        ) {

            firebase.auth().currentUser.getIdToken(false).then(idToken => {
                axios.get(`${config.apiUrl}/projects/${openPid}`, {
                    headers: {
                        authorization: idToken
                    }
                }).then(response => {
                    console.log(response)
                    if (response && response.data && response.data.code && response.data.title) {
                        props.updateCode(response.data.code);
                        var titleElement = document.getElementById('projectTitle');
                        if (titleElement !== null) {
                            titleElement.value = response.data.title;
                        }
                        setProjectId(response.data.projectId);
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
                        setProjectList(response.data)
                    })
            })
        }
    }






    return (
        <header className="header">
            <span style={{ width: "20px" }}></span>
            {user && user.displayName ?
                <div onClick={toggleUserMenu} className="" style={userLogoStyle}>
                    <p>{user.displayName.substr(0, 1)}</p>
                </div>
                :
                <div style={loginStyle} >
                    <span onClick={signIn}>Login</span>
                </div>

            }

            <span id="dummyClickToClearPid" style={{ display: 'none' }} onClick={() => { setProjectId(null) }}></span>
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
                <>
                    <div id="fullPage" className={userMenuShow ? "fullPage" : null} onClick={(e) => { setUserMenuShow(false) }}></div>
                    <div id="userMenuWrapper" className={userMenuShow ? "userMenu userMenuShow" : "userMenu"} onClick={(e) => { e.stopPropagation() }}>

                        <UserMenu
                            refreshUserMenu={refreshUserMenu}
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
