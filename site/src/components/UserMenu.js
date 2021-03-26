import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app'
import 'firebase/auth'
import axios from 'axios';
import { config } from '../config'
import { useUser } from 'reactfire'


function UserMenu(props) {

    const { data: user } = useUser();

    const [projectList, setProjectList] = useState(props.projectList);


    useEffect(() => {
        setProjectList(props.projectList);
    }, [props.projectList]);


    const menuStyle = {
        minWidth: '200px',
        paddingRight: '75px',
        paddingLeft: '15px',
        fontSize: "1.2rem",
        cursor: "pointer",
        zIndex: 999
    }

    const textStyle = {
        paddingTop: 0,
        lineHeight: "1rem",
        marginBlockStart: "1em",
        marginBlockEnd: "1em",
    }

    const signOut = () => {
        firebase.auth().signOut();
    }


    const copyProjectLink = async (pid) => {
        var data = `${process.env.REACT_APP_BASE_URL}/pr${pid}`;
        navigator.clipboard.writeText(data).then(function () {
            //console.log("Copied");
        }, function () {
            console.error("Unable to write to clipboard");
        });
    }

    return (
        <div style={menuStyle}>
                <h4 onClick={signOut} style={textStyle}>Sign Out</h4>
                {
                    projectList.map((project) =>
                        <div key={project.title}>
                            <span key={`${project.title}span`} onClick={() => { props.getSingleProject(project.projectId) }} style={{ marginRight: "10px" }}>{project.title}</span><br />
                            <span key={`${project.title}del`} style={{ marginRight: "10px", fontSize: "1rem" }} onClick={() => { props.deleteProject(project.projectId) }}>[delete]</span>
                            <span key={`${project.title}copy`} style={{ fontSize: "1rem" }} onClick={() => { copyProjectLink(`${project.projectId}`) }}>[copy link]</span>
                        </div>

                    )

                }
            </div>

    )

}

export default UserMenu;