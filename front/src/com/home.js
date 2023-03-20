import React, { useContext } from "react";

import { Login } from './login';
import { UserContext } from '../context/UserContext';

import { Routes, Route, useParams } from "react-router-dom";


import { Nav } from './sub/nav';
import { ViewProfile } from './ViewProfile';
import { EditProfile } from './EditProfile';



import { PeopleList } from './peopleList';
import { NotFound } from './NotFound';

import './home.css';





function HomeBody(props) {
    return (
        <main className="main">

            <Routes>
                <Route path="/editProfile" element={<EditProfile />} />

                <Route path="/list" element={<PeopleList />} />
                <Route path="/" element={<ViewProfile />} />
                <Route path="/profile/:uid" element={<ViewProfile />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </main>
    );
}

function RealHome(props) {

    return (
        <div className="home">
            <Nav />
            <HomeBody />
        </div>
    );
}


function Home(props) {
    const ctx = useContext(UserContext);

    return (
        <>
            {ctx.account ? <RealHome /> : <Login />}
        </>

    );
}

export { Home };
