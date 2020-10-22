import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import {experimentsList} from '../data/experiments.js'


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
        if(experimentsList){
            this.setState({
                projectsAvailable: experimentsList
            })
            this.props.countLines();
        }
        
    }

    loadCodeFromProject(projectName){
        for(var project of this.state.projectsAvailable){
            if(project.name === projectName){
                document.getElementById("procs").value = project.code;
                this.props.toggleModal();
            }
        }
    }

    render() {
        return (
            <div id="newProjectModal" className="modal">
                <div className="modalContent">
                    <span className="close" onClick={() => this.props.toggleModal()}>&times;</span>
                    <h3>New Project</h3>
                    <br />
                    <div>
                        {this.state.projectsAvailable.map(project => (
                            <div key={project.name + "div"}>
                                <span onClick={() => {this.loadCodeFromProject(project.name)}} key={project.name}>{project.name}</span><br />
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
