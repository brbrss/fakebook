import React, { useContext } from "react";
import {UserContext} from '../../context/UserContext';
import { Link } from "react-router-dom";


function AccountSpan(props) {
    const ctx = useContext(UserContext);
    const profile = ctx.profile;
    //console.log(profile);
    
    return (
        <form action="/credential/logout" method="post">
            Logged in as:  {profile.firstName} {profile.lastName}&nbsp;
            <Link to="/editProfile">Edit Profile</Link> &nbsp;
            <button type="submit">Log out</button>
        </form>
    );

}

export { AccountSpan };
