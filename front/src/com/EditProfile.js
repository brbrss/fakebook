import React, { useState, useContext, useReducer } from "react";
import { UserContext } from "../context/UserContext";

import './EditProfile.css';

function redfun(state, val) {
    if (val) {
        return { disabled: val };
    }
    return { disabled: !state.disabled };
}

function EditInfo(props) {
    const ctx = useContext(UserContext);
    const profile = ctx.profile;

    const initInfo = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthday: new Date(profile.birthday).toISOString().substring(0, 10),
        info: profile.info
    };
    const [state, setState] = useState(initInfo);
    const [toggle, toggleDispatch] = useReducer(redfun, { disabled: true });
    function handleInput(e) {
        setState({ ...state, [e.target.name]: e.target.value })
    }
    function editFun(e) {
        setState(initInfo);
        toggleDispatch();
    }
    async function submit(ev) {
        ev.preventDefault();
        let formData = new FormData(ev.target);
        let object = {};
        formData.forEach((value, key) => object[key] = value);
        let json = JSON.stringify(object);
        await fetch(ev.target.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        });
        toggleDispatch(false);
        ctx.updateUser();
    }
    return (
        <form className="editInfo" action="/user/update" method="POST" onSubmit={submit}>
            <input type="text" name="uid" defaultValue={profile.uid} hidden />
            <label>
                First Name
                <input type="text" name="firstName" value={state.firstName} onChange={handleInput} disabled={toggle.disabled} />
            </label>
            <br/>
            <label>
                Last Name
                <input type="text" name="lastName" value={state.lastName} onChange={handleInput} disabled={toggle.disabled} />
            </label>
            <br />
            <label>
                Birthday
                <input type="date" name="birthday" value={state.birthday} onChange={handleInput} disabled={toggle.disabled} />
            </label>
            <br />
            <label>
                Info
                <textarea name="info" value={state.info} onChange={handleInput} disabled={toggle.disabled} />
            </label>
            <br />
            <button type="button" onClick={editFun}>{toggle.disabled ? "Edit" : "Cancel"}</button>
            <button type="submit" hidden={toggle.disabled}>Submit Now</button>
        </form>
    );
}

function EditAvatar(props) {
    const ctx = useContext(UserContext);
    //const [imgpath, setImgpath] = useState(null);
    async function submit(ev) {
        ev.preventDefault();

        const fileField = document.querySelector('editAvatar input[type="file"]');
        let formData = new FormData(ev.target);
        formData.append('uid', ctx.profile.uid);
        formData.append('file', fileField.files[0]);

        await fetch(ev.target.action, {
            method: 'POST',
            body: formData
        });
        ctx.updateUser();
    }

    return (
        <form className="editAvatar" action="user/avatar" method="POST" enctype="multipart/form-data">
            <input type="text" name="uid" defaultValue={ctx.profile.uid} hidden />
            <img className="avatar" src={ctx.profile.avatar} alt="avatar" />
            <input type="file" name="file" required />
            <button>Submit</button>
        </form>
    );
}


function EditProfile(props) {
    return (
        <>
            <EditInfo />
            <EditAvatar />
        </>


    );
}

export { EditProfile };

