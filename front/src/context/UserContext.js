import React from "react";


const UserContext = React.createContext({ profile: null, account: null, updateUser: () => { } });

export { UserContext };
