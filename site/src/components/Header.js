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




function Header(props) {

    var projects;
    projects = new Projects();


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

    const [projectList, setProjectList] = useState([]);
    const [refreshUserMenu, setRefreshUserMenu] = useState(false);
    const [saveState, setSaveState] = useState("");
    const [projectId, setProjectId] = useState(null);


    //On mount, check to see if a project is defined in the URL.
    //All links have the format /pr${projectId}, so we check if 'pr' is the start of it and take the rest.
    //This way you can still use URLs like /settings or whatever in the future, you just can't start them with pr.

    //Currently missing: shared links will open as though they belong to you; if they don't, you have an issue. Author should
    //be displayed now on the frontend, and if it isn't you saving won't work. In the future we can look into collaborative files or something.

    useEffect(() => {
        if (window.location.pathname.substr(1) && window.location.pathname.substr(1, 2) === "pr") {
            setProjectId(window.location.pathname.substr(3));

            axios.get(`${config.apiUrl}/projects/${window.location.pathname.substr(3)}`, {
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

        firebase.auth().onAuthStateChanged(function (user) {
            projects.getRecoverEntry().then(recoveryProject => console.log(recoveryProject))

            /*

            projects.getRecoverEntry().then(recoveryProject => {
                if (recoveryProject && recoveryProject[0] && recoveryProject[0]['code']) {
                    console.log("db")
                    props.updateCode(recoveryProject[0]['code'])
                    props.updateCode(recoveryProject[0]['code'])
                    document.getElementById("projectTitle").value = "Recovered"

         
                    
                    if (recoveryProject[0]['projectId'] && user) {
                        console.log("project")
                        //this is not a robust solution - it assumes that we're connected, that the correct user is the one on the computer,
                        //and that we get a good response and don't need to fallback to code. Obviously all of that is wrong and we 
                        //need to be more robust in the future.
                        getSingleProject(recoveryProject[0]['projectId']);
                    } else {
                        console.log("no")
                        console.log(recoveryProject[0])
                        console.log(user)
                        props.updateCode(recoveryProject[0]['code'])
    
                        document.getElementById("projectTitle").value = "Recovered"
                    }
    
                 




                    //this is a little weird with cloud saves; we're just going to change the title to 'recovered', and hope that makes it clear
                    //the problem is if you go in and it already has the project you were working on you might not realize it's different


                }
            });



            if (user && user.uid) {
                //got user

            } else {
                // No user is signed in.
            }
            */
        });

    },
        [],
    )

    //handle recovery on render
    useEffect(() => {
         /*
        projects.initializeDatabase();


        //Due to issues with setInterval, code and projectID are handled separately with saving. ProjectId is updated in the database when its state is updated; code is updated periodically.
        //One thing to note is that the 'code' entry isn't necessarily in sync with the 'projectId' entry - the projectId should supercede the code entry, and we trust that users saved appropriately 
        //when using cloud projects.


        //Here we get the code
       
        setInterval(() => {

            projects.writeLastCodeToLocalStorage(document.getElementById("procs").value);
        }, 1000);
        */

    },
        [])




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
        if (menu !== null) {
            menu.classList.toggle("userMenuShow");
        }

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
                        setProjectId(null);
                    })
            })
        }
    }


    const getSingleProject = (openPid) => {

        projects.writePidToStorage(openPid);


        toggleUserMenu();
        if (user && user.uid) {
            firebase.auth().currentUser.getIdToken(false).then(idToken => {
                axios.get(`${config.apiUrl}/projects/${openPid}`, {
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
                <input type="text" id="projectTitle" defaultValue="Untitled" style={titleInputStyle} maxLength="22"></input>
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
