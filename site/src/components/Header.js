import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import Projects from './Projects.js';
var projects;

export default class Header extends Component {

    componentDidMount() {
        projects = new Projects();
    }

    componentDidUpdate() {

    }

    loadFile() {
        document.getElementById("load").click();
        document.getElementById("procs").focus();
    }

    saveAs() {
        projects.saveAs();
    }

    toggleNewProject() {
        this.props.toggleNewProjectModal();
    }


    render() {
        return (
            <header className="header">
                <span style={{ width: "10px" }}></span>
                <div className="buttonDiv" onClick={() => this.toggleNewProject()}>
                    <img src="/images/newProject.png"></img>
                    <span>New Project</span>
                </div>
                <div className="buttonDiv" onClick={() => this.saveAs()}>
                    <img src="/images/download.png"></img>
                    <span>Save File</span>
                </div>
                <div className="buttonDiv" onClick={() => this.loadFile()}>
                    <img src="/images/upload.png"></img>
                    <span>Load File</span>
                </div>
                <a href="https://docs.lbym.org" target="_new">
                    <div className="buttonDiv">
                        <span>Docs</span>
                    </div>
                </a>
                <div id="connectButton" className="buttonDiv" style={{ minWidth: "100px", position: "fixed", right: "50px" }}>
                    <img src="/images/connect-icon.png"></img>
                    <span>Connect</span>
                </div>
                <div id="disconnectButton" className="buttonDiv" style={{ display: "none", position: "fixed", right: "50px" }}>
                    <img src="/images/connect-icon.png"></img>
                    <span>Disconnect</span>
                </div>
                <span style={{ width: "10px" }}></span>
            </header>
        );
    }
}
