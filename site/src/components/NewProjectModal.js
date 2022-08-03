/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off", react-hooks/exhaustive-deps: off */

import React from 'react';
import { experimentsList } from '../data/experiments.js';

const OpenDataModal = (props) => {

    const loadNewTemplate = (code) => {

        //the code is a static file, so we need to load the content and apply it
        var request = new XMLHttpRequest();
        request.open('GET', code, true);
        request.send(null);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                props.updateCode(request.responseText);
                document.getElementById("projectTitle").value = "Untitled"

                //TODO: This is a hack. We shouldn't do it. Look at how data flows and fix it.

                document.getElementById("dummyClickToClearPid").click();
                document.getElementById('dummyClickToClearAuthor').click();
                props.toggleModal();
            }
        }
    }

    return (
        <div id="dataModal" className="modal" onClick={() => props.toggleModal()}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={() => props.toggleModal()}>&times;</span>
                <h3>New Project</h3>
                <br />
                <div>
                    {experimentsList.map(item => (
                        <div
                            style={{ cursor: 'pointer' }}
                            key={item.name}
                            onClick={() => { loadNewTemplate(item.code) }}>
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}


export default OpenDataModal;