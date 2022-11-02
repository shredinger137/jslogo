import React from 'react'
import { deleteProject } from '../interface/api'

const Project = (props) => {

  const copyProjectLink = async (pid) => {
    var data = `${process.env.REACT_APP_BASE_URL}/pr${pid}`;
    navigator.clipboard.writeText(data).then(function () {
    }, function () {
        console.error("Unable to write to clipboard");
    });
}

  return (
    <div className="project" key={props.project.title} style={{ marginTop: "10px", padding: "5px" }}>

      <div style={{ paddingBottom: "5px", cursor: 'pointer' }}
        onClick={() => { props.getSingleProject(props.project.projectId) }}>
        <span key={`${props.project.title}span`}

          style={{ marginRight: "10px" }}>{props.project.title}
        </span>
      </div>

      <span key={`${props.project.title}del`} style={{ marginRight: "10px", fontSize: "1rem", cursor: 'pointer' }} onClick={() => { props.deleteProject(props.project.projectId) }}>[delete]</span>
      <span key={`${props.project.title}copy`} style={{ fontSize: "1rem", marginRight: '10px', cursor: 'pointer' }} onClick={() => { copyProjectLink(`${props.project.projectId}`) }}>[copy link]</span>

    </div>
  )
}

export default Project;