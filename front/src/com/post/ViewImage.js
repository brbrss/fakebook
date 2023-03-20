import React from "react";

import './ViewImage.css';


function ViewImage(props) {
    return (<>
        <button className="view-image" onClick={props.cb}>
            <img className="view-image" alt="" src={props.src}></img>
            Click to close.
        </button>
    </>);
}

export { ViewImage };