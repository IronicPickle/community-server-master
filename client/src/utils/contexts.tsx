import React from "react";

type GlobalContextProps = { 
  toggleLoader: Function;
  loggedIn: boolean;
  toggleLoginContainer: any;
  loginContainerActive: boolean;
}

export const GlobalContext = React.createContext<Partial<GlobalContextProps>>({});