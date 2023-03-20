import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css';

import { Home } from './com/home';
import { Signup } from './com/signup';
import React, { useState, useEffect } from "react";
import { UserContext } from './context/UserContext';
import {TrialPage} from './com/TrialPage';
import { NotFound } from './com/NotFound';

async function fetchProfile() {

  const res = await fetch('/user');
  try {
    const jdata = await res.json();
    //console.log('jdata is ', jdata);
    return jdata;
  } catch (e) {
    return null;
  }

}



function App() {
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);

  async function updateUser() {
    const res = await fetchProfile();
    setAccount(res.account);
    setProfile(res.profile);
  }
  useEffect(() => {
    updateUser();
  }, []);

  const ctxValue = { profile, account, updateUser };

  return (
    <div className="App">

      <UserContext.Provider value={ctxValue}>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/trial" element={<TrialPage />} />
            <Route path="/*" element={<Home />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </UserContext.Provider >

    </div >
  );
}

export default App;
