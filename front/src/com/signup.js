import React, { useState, useContext } from "react";
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';


function Signup(props) {
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [firstName, setFirstName] = useState('');
    let [lastName, setLastName] = useState('');
    let [birthday, setBirthday] = useState(null);

    async function handleSubmit(e) {
        e.target.submit();
    };

    const ctx = useContext(UserContext);
    if (ctx.account) {
        return (<Navigate to='/' />);
    }

    return (
        <form action="/credential/signup" method="POST" onSubmit={handleSubmit}>
            Signup <br />
            <label>
                Username &nbsp;
                <input type="text"
                    name="username"
                    minLength="2"
                    maxLength="16"
                    pattern="[a-zA-Z0-9]+"
                    value={username}
                    required
                    onChange={e => setUsername(e.target.value)} />
            </label><br />
            <label>
                Password &nbsp;
                <input
                    type="password"
                    name="password"
                    value={password}
                    minLength="6"
                    maxLength="16"
                    required
                    onChange={e => setPassword(e.target.value)} />
            </label><br /><br />

            <label>
                First Name &nbsp;
                <input type="text"
                    name="firstName"
                    minLength="2"
                    maxLength="16"
                    value={firstName}
                    required
                    onChange={e => setFirstName(e.target.value)} />
            </label><br />

            <label>
                Last Name &nbsp;
                <input type="text"
                    name="lastName"
                    minLength="1"
                    maxLength="16"
                    value={lastName}
                    required
                    onChange={e => setLastName(e.target.value)} />
            </label><br />

            <label>
                Birthday &nbsp;
                <input type="date"
                    name="birthday"
                    minLength="1"
                    maxLength="16"
                    value={birthday}
                    required
                    onChange={e => setBirthday(e.target.value)} />
            </label><br />

            <button type="submit">Sign Up</button>
        </form>
    );
}

export { Signup };
