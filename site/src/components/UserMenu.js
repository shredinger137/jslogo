import React from 'react';
import firebase from 'firebase/app'
import 'firebase/auth'



function UserMenu(props){

    const menuStyle = {
        minWidth: '200px',
        paddingRight: '75px',
        paddingLeft: '15px',
        fontSize: "1.2rem",
    }

    const textStyle = {
        paddingTop: 0,
        lineHeight: "1rem",
        marginBlockStart: "1em",
        marginBlockEnd: "1em",
    }


    const ulStyle = {
        listStyle: "none",
        textAlign: "left",
        paddingLeft: '0px',
    }

    const signOut = () => {
        firebase.auth().signOut();
    }

    return (
        <div style={menuStyle}>
            <h4 onClick={signOut} style={textStyle}>Sign Out</h4>
            <h4 style={textStyle}>User Settings</h4>
            <br />
            <h4 style={textStyle}>Projects</h4>
            <hr/>
            <ul style={ulStyle}>
                <li>Test</li>
                <li>Test2</li>
            </ul>
            <span onClick={props.toggleUserMenu}>Toggle</span>
        </div>
    )

}

export default UserMenu;