import React from "react";


function DateSpan(props) {
    const date = new Date(props.date);
    const s = date.toLocaleString();
    return (
        <time dateTime={s}>{s}</time>
    );

}

export { DateSpan };
