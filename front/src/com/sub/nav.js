import React, { useContext } from "react";
import { AccountSpan } from './AccountSpan';

import { Link } from "react-router-dom";
import './nav.css';

function Nav(props) {
  
    return (
        <nav>
            <Link to="/">Fakebook</Link>
            <Link to="/list">People List</Link>

            <AccountSpan />
        </nav>
    );

}

export { Nav };