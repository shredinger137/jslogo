/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", no-loop-func: "off" */

import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import { experimentsList } from '../data/experiments.js'

export default class NewProjectModal extends Component {

    state = {
        projectsAvailable: []
    };

    componentDidMount() {
        this.getAvailableProjects();
    }

    componentDidUpdate() {

    }

    getAvailableProjects() {
        if (experimentsList) {
            this.setState({
                projectsAvailable: experimentsList
            })
        }
    }

    loadCodeFromProject(projectName) {
        //TODO: We're not using the 'unsaved changes' value correctly. We should not prompt if it's not unsaved.
        //TODO: Eventually all files will have a 'fileLocation' field, in which case this conditional can be removed.
        var scopedUpdateCode = this.props.updateCode;
        console.log(scopedUpdateCode);

            if (window.confirm("Any unsaved changes will be lost. Continue?")) {
                for (var project of this.state.projectsAvailable) {
                    if (project.name === projectName) {
                        if (project.fileLocation) {
                            var request = new XMLHttpRequest();
                            request.open('GET', project.fileLocation, true);
                            request.send(null);
                            request.onreadystatechange = function () {
                                if (request.readyState === 4 && request.status === 200) {
                                    scopedUpdateCode(request.responseText);
                                }
                            }
                        } else {
                            console.log("error: no filename specified");
                        }
                    }
                    this.props.toggleModal();
                }
            } else {
                this.props.toggleModal();
            }



    }


    stopProp(e){
        e.stopPropagation();
    }

    render() {
        return (
            <div id="newProjectModal" className="modal" onClick={() => this.props.toggleModal()}>
                <div className="modalContent" onClick={(e) => this.stopProp(e)}>
                    <span className="close" onClick={() => this.props.toggleModal()}>&times;</span>
                    <h3>New Project</h3>
                    <br />
                    <div>
                        {this.state.projectsAvailable.map(project => (
                            <div key={project.name + "div"}>
                                <span onClick={() => { this.loadCodeFromProject(project.name) }} key={project.name}>{project.name}</span><br />
                            </div>
                        )
                        )
                        }
                    </div>
                </div>
            </div>
        );
    }
}
