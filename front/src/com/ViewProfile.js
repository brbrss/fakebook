import React, { useContext, useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { UserContext } from '../context/UserContext';

import { PostArea } from './post/PostArea';
import { Avatar } from './sub/Avatar';

import './ViewProfile.css';

function UserInfoSection(props) {
    const profile = props.profile;
    const avatar = profile.avatar;

    return (
        <aside className="profile">
            <Avatar src={avatar} />
            <div className="desc">
                {profile.firstName} {profile.lastName}
                <br />
                Birthday: {new Date(profile.birthday).toLocaleDateString("en-CA")}
                <br />
                <span className="info">
                    {profile.info}
                </span>
            </div>
        </aside>
    );
}

function ViewProfile(props) {
    let { uid } = useParams();

    const ctx = useContext(UserContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    async function getProfile(id) {
        const res = await fetch("/user/profile/" + id);
        setProfile(await res.json());
        setLoading(false);
    }

    useEffect(() => {
        if (uid) {
            getProfile(uid);
        } else {
            setProfile(ctx.profile);
            setLoading(false);
        }
    }, [uid, ctx.profile]);

    return (
        <div className="homebody">
            {loading ? "Loading" :
                <>
                    <UserInfoSection profile={profile} />
                    <PostArea uid={profile.uid} />
                </>
            }
        </div>
    );
}


export { ViewProfile };
