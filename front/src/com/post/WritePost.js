import React, { useState } from "react";

import './WritePost.css';

function WritePost(props) {
    const [content, setContent] = useState('');

    async function handleSubmit(ev) {
        ev.preventDefault();
        let formData = new FormData(ev.target);
        //formData.append('content', content);

        await fetch(ev.target.action, {
            method: ev.target.method,
            body: formData
        });
        setContent('');
        props.refreshCb();
    };

    function handleInput(ev) {
        setContent(ev.target.value);
    }

    return (
        <form className="write-post" action="/post/write" method="POST"  encType="multipart/form-data" onSubmit={handleSubmit} >
            <label>
                Write Post <br />
                <textarea name="content" value={content} onChange={handleInput} minLength="15" required />
            </label><br />
            <label>
                Upload Image<br/>
                <input type="file" id="file" name="f" multiple />
            </label>
            <button>Post</button>
        </form>
    );
}

export { WritePost };
