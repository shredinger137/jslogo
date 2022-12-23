import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app'
import 'firebase/auth'
import '../../css/menus.css'
import Project from './Project';

function UserMenu(props) {


    const [projectList, setProjectList] = useState(props.projectList);


    useEffect(() => {
        setProjectList(props.projectList);
    }, [props.projectList, props.networkError]);


    const menuStyle = {
        minWidth: '200px',
        maxHeight: '90vh',
        minHeight: 'calc(100vh - 50px)',
        paddingRight: '35px',
        paddingLeft: '5px',
        fontSize: "1.2rem",
        zIndex: 999,
        overflowY: 'auto',
        paddingBottom: '25px'
    }

    const signOut = () => {
        props.projects.writePidToStorage(false);
        props.projects.writeLastCodeToLocalStorage(false)
        localStorage.removeItem('username');
        firebase.auth().signOut();
    }


    const copyProjectLink = async (pid) => {
        var data = `${process.env.REACT_APP_BASE_URL}/pr${pid}`;
        navigator.clipboard.writeText(data).then(function () {
        }, function () {
            console.error("Unable to write to clipboard");
        });
    }

    const convertDate = (dateString) => {
        if (dateString === undefined) { return false }
        let date = new Date(dateString);
        return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    }



    return (
        <div style={menuStyle}>

            <h4 onClick={signOut} style={{
                paddingTop: 0,
                lineHeight: "1rem",
                marginBlockStart: "1em",
                marginBlockEnd: "1em",
                cursor: 'pointer'
            }}>Sign Out</h4>
            {props.networkError ? <p style={{ color: 'darkred', fontSize: '1rem' }}>Network error:<br />unable to load projects</p> : null}
            {
                projectList.map((project) =>
                    <Project
                        key={`${project.projectId}wrapper`}
                        project={project}
                        copyProjectLink={copyProjectLink}
                        getSingleProject={props.getSingleProject}
                        deleteProject={props.deleteProject}
                    />
                )
            }

            {
                props.recoveryEntry ?
                    <div className="project" key='recovery' style={{ marginTop: "5px", padding: "5px" }}>
                        <span key='recoverytitle'
                            onClick={() => { props.loadRecoveredCode() }}
                            style={{ marginRight: "10px" }}>Recovered Code</span><br />
                        <span style={{ fontSize: '.6em' }}>{convertDate(props.recoveryEntry.date)}</span>
                    </div>
                    :
                    null
            }
        </div>

    )

}

export default UserMenu;