import React from "react";
import { ViewPost } from './ViewPost';





function Timeline(props) {



    return (
        <div className="timeline">
            Timeline
            <br />
            {props.postList.map((t) => <ViewPost post={t} key={t._id} />)}

        </div>
    );
}


export { Timeline };
