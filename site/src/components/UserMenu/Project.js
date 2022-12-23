import React, { useState } from 'react'
const Project = (props) => {

  const [deleting, setDeleting] = useState(false);

  const copyProjectLink = async (projectId) => {
    var data = `${process.env.REACT_APP_BASE_URL}/pr${projectId}`;
    navigator.clipboard.writeText(data).then(function () {
    }, function () {
      console.error("Unable to write to clipboard");
    });
  }

  return (
    <>
      {
        !deleting ?
          < div className="project" style={{ marginTop: "10px", padding: "5px"}}>

            <div style={{ paddingBottom: "5px", cursor: 'pointer' }}
              onClick={() => { props.getSingleProject(props.project.projectId) }}>
              <span key={`${props.project.title}span`}

                style={{ marginRight: "10px" }}>{props.project.title}
              </span>
            </div>

            <span key={`${props.project.title}del`} style={{ marginRight: "10px", fontSize: "1rem", cursor: 'pointer' }} onClick={() => {  setDeleting(true) }}>[delete]</span>
            <span key={`${props.project.title}copy`} style={{ fontSize: "1rem", marginRight: '10px', cursor: 'pointer' }} onClick={() => { copyProjectLink(`${props.project.projectId}`) }}>[copy link]</span>

          </div >
          :
          < div className="project" style={{ marginTop: "10px", padding: "4px", border: '1px solid red', backgroundColor: 'rgba(0, 0, 0, .2)'  }}>
            <div style={{ paddingBottom: "5px"}}>
              <span key={`${props.project.title}prompt`}

                style={{ marginRight: "10px" }}>Delete?
              </span>
            </div>
            <span style={{ marginRight: "10px", fontSize: "1rem", cursor: 'pointer' }} onClick={() => { props.deleteProject(props.project.projectId) }}>[delete]</span>
            <span style={{ fontSize: "1rem", marginRight: '10px', cursor: 'pointer' }} onClick={() => { setDeleting(false) }}>[cancel]</span>
          </div>


      }

    </>

  )
}

export default Project;