import React from "react";

type GlobalContextProps = { 
  loggedIn: boolean;
  toggleLoader: Function;
  toggleBackdrop: Function;
  toggleNotification: Function;
  toggleContainer: Function;
}

export const GlobalContext = React.createContext<Partial<GlobalContextProps>>({});