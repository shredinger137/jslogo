import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import Projects from './Projects.js';
var projects;

export default class Header extends Component {

    componentDidMount() {
        projects = new Projects;
    }



    componentDidUpdate() {

    }

    showMenu(){
        document.getElementById("menu").classList.toggle("menuExpanded");
    }

    loadFile(){
        document.getElementById("menu").classList.remove("menuExpanded");
        document.getElementById("load").click();
        document.getElementById("procs").focus();
    }

    saveAs(){
        projects.saveAs();
        document.getElementById("menu").classList.remove("menuExpanded");
    }


    render() {
        return (
            <header className="header">
                <span onClick={() => this.showMenu()} tabIndex="0" onKeyPress={() => this.showMenu()}>Menu</span>
                <div id="menu" className="menu">
                    <span><b>Projects</b></span>
                    <ul>
                        <li style={{color: "gray"}}>New Project</li>
                        <li><span onClick={() => this.loadFile()}>Load File</span></li>
                        <li onClick={() => this.saveAs()}>Save File</li>
                    </ul>
                </div>
            </header>
        );
    }
}
