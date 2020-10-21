import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import { config } from '../config.js';
import axios from 'axios';



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
        axios.get(`${config.apiUrl}/availableProjects`).then(res => {
            if (res.data) {
                this.setState({projectsAvailable: res.data});
            }

        })
    }

    loadCodeFromProject(projectName){
        for(var project of this.state.projectsAvailable){
            if(project.name == projectName){
                document.getElementById("procs").value = project.code;
                this.props.toggleModal();
            }
        }
    }

    render() {
        return (
            <div id="newProjectModal" class="modal">
                <div class="modalContent">
                    <span class="close" onClick={() => this.props.toggleModal()}>&times;</span>
                    <h3>New Project</h3>
                    <br />
                    <div>
                        {this.state.projectsAvailable.map(project => (
                            <>
                                <span onClick={() => {this.loadCodeFromProject(project.name)}}>{project.name}</span><br />
                            </>
                        )
                        )
                        }
                    </div>
                </div>
            </div>
        );
    }
}
