import React, { useState } from "react";

function WriteComment(props) {
    const [content, setContent] = useState('');
    function handleInput(ev) {
        setContent(ev.target.value);
    }
    async function submitFun(ev) {
        ev.preventDefault();
        let formData = new FormData(ev.target);
        const url = '/post/comment/' + props.pid;
        await fetch(url, {
            method: 'POST',
            body: formData
        });
        setContent('');
        props.refreshCb();
    }
    return (
        <form className='write-comment' onSubmit={submitFun}>
            <textarea value={content} name='content' onChange={handleInput} />
            <button type='submit'>Submit Comment</button>
        </form>
    );
}

export default WriteComment;
