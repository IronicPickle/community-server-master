import React from "react";
import { DBMemberDataExtended } from "../http_utils/HTTPAuth";

export interface Notification {
  type?: "success" | "info" | "warning" | "error";
  message: string;
  hideDelay?: number;
}

export type Containers = [
  "login" | "createMember" | "editMember" | "requestMember" | "requestsMember" | "createMission"
]

type GlobalContextProps = { 
  loggedIn: boolean;
  memberData?: DBMemberDataExtended;
  toggleLoader: (state: boolean) => void;
  toggleBackdrop: (state: boolean, isCancelled: boolean, backdropOnClose?: (isCancelled: boolean) => void) => void;
  toggleNotification: (state: boolean, data: Notification) => void;
  toggleContainer: (container: Containers, state: boolean, callback?: () => void, data?: any) => void;
  copyToClipboard: (string: string) => void;
}

export const GlobalContext = React.createContext<Partial<GlobalContextProps>>({});