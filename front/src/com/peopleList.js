import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { UserContext } from '../context/UserContext';
import { Avatar } from './sub/Avatar';
import './peopleList.css';


function DecideFriend(props) {
    async function accept() {
        const url = "/user/accept/" + props.uid;
        await fetch(url, { method: "POST" });
        props.cbFriend(true);
    }
    async function decline() {
        const url = "/user/decline/" + props.uid;
        await fetch(url, { method: "POST" });
        props.cbRequest(false);
    }
    return (
        <>
            <button onClick={accept}>Accept</button>
            <button onClick={decline}>Decline</button>
        </>
    );
}

function FriendStatus(props) {
    const selfId = useContext(UserContext).profile.uid;

    const [requested, setRequested] = useState(props.u.isRequested);
    const [requestedMe, setRequestedMe] = useState(props.requestedMe);
    const [friend, setFriend] = useState(props.u.isFriend);

    async function sendRequest(targetUid) {
        const url = "/user/request/" + targetUid;
        await fetch(url, { method: 'POST' });
        setRequested(true);
    }

    let s = '';
    if (props.u.uid === selfId) {
        s = '(YOU)';
    }
    else if (friend) {
        s = "Friend";
    }
    else if (requestedMe) {
        s = (<DecideFriend uid={props.u.uid} cbFriend={setFriend} cbRequest={setRequestedMe} />);
    }
    else if (requested) {
        s = "Requested";
    } else {
        s = <button onClick={() => sendRequest(props.u.uid)} >Send Request</button>;
    }
    return <span className="friend">{s}</span>;
}

function UserRow(props) {
    const u = props.user;
    return (
        <div className="userRow">
            <Link to={"/profile/" + u.uid} >
                <Avatar src={u.avatar} />
                <span className="name">{u.firstName} {u.lastName}</span>
            </Link>
            <FriendStatus u={u} requestedMe={props.requestedMe} />
        </div>
    );
}

function PeopleList(props) {
    const [err, setErr] = useState('');
    const [userList, setUserList] = useState([]);
    const [requestedMeList, setRequestedMeList] = useState([]);

    async function getMylist() {
        const url = "/user/requestlist";
        const res = await fetch(url);
        if (res.status === 200) {
            const me = await res.json();
            setRequestedMeList(me);
            setErr('');
        } else {
            setErr('Timeline returned with status: ' + res.status);
        }
    }

    async function getList() {
        const url = "/user/list";
        const res = await fetch(url);
        if (res.status === 200) {
            const newList = await res.json();
            if (!Array.isArray(newList)) {
                setErr("Return value is not array.");
                return;
            }
            setUserList(newList);
            setErr('');
        } else {
            setErr('Timeline returned with status: ' + res.status);
        }
    }
    useEffect(() => {
        getMylist();
        getList();
    }, []);

    return (
        <div>
            <h3>List of People</h3>

            {userList.map(u =>
            (<UserRow
                user={u}
                key={u.uid}
                requestedMe={requestedMeList.includes(u.uid)}
            />)
            )}

        </div>
    );
}

export { PeopleList };

