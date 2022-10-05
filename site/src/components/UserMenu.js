import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app'
import 'firebase/auth'
import '../css/menus.css'

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
        cursor: "pointer",
        zIndex: 999,
        overflowY: 'auto',
        paddingBottom: '25px'
    }

    const textStyle = {
        paddingTop: 0,
        lineHeight: "1rem",
        marginBlockStart: "1em",
        marginBlockEnd: "1em",
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

            <h4 onClick={signOut} style={textStyle}>Sign Out</h4>
            {props.networkError ? <p style={{color: 'darkred', fontSize: '1rem'}}>Network error:<br />unable to load projects</p> : null}
            {
                projectList.map((project) =>
                    <div className="project" key={project.title} style={{ marginTop: "5px", padding: "5px" }}>
                        <span key={`${project.title}span`}
                            onClick={() => { props.getSingleProject(project.projectId) }}
                            style={{ marginRight: "10px" }}>{project.title}</span><br />

                        <span key={`${project.title}del`} style={{ marginRight: "10px", fontSize: "1rem" }} onClick={() => { props.deleteProject(project.projectId) }}>[delete]</span>
                        <span key={`${project.title}copy`} style={{ fontSize: "1rem", marginRight: '10px' }} onClick={() => { copyProjectLink(`${project.projectId}`) }}>[copy link]</span>

                    </div>

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