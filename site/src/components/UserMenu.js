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
        cursor: "pointer"
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

    return (
        <div style={menuStyle}>
            <h4 onClick={signOut} style={textStyle}>Sign Out</h4>
            {
                projectList.map((project) =>
                    <div>
                        <span onClick={() => { props.getSingleProject(project.projectId) }} style={{ marginRight: "10px" }}>{project.title}</span>
                        <span onClick={() => { props.deleteProject(project.projectId) }}>[delete]</span>
                    </div>
                )

            }
        </div>
    )

}

export default UserMenu;