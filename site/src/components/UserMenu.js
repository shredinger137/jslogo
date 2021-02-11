import React from 'react';
import firebase from 'firebase/app'
import 'firebase/auth'



function UserMenu(props){

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
        </div>
    )

}

export default UserMenu;