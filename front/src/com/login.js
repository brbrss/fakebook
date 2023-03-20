import React, { useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import './login.css';

function Login(props) {
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.target.submit();
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const loginerr = searchParams.get("e")==='login-failure';
    const msg = 'Username does not exist or password does not match.';
    return (
        <div className="login-screen">
            <div className="title">FakeBook</div>
            <span>You are not logged in.</span> 
            {loginerr?<span>{msg}</span>:''}
            <form action="/credential/login" method="POST" onSubmit={handleSubmit}>
                <label>
                    Username
                    <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} required />
                </label><br />
                <label>
                    Password
                    <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </label><br />
                <button type="submit">Login</button>
            </form>
            Don't have an account? <Link to="/signup">Sign-up here</Link>
        </div>
    );
}

export { Login };
