import React from "react";
import { DBMemberDataExtended } from "../http_utils/HTTPAuth";

export interface Notification {
  type?: "success" | "info" | "warning" | "error";
  message?: string;
  hideDelay?: number;
}

export type Containers = "login" | "createMember" | "editMember" | "requestMember" | "requestsMember" | "createMission"

export type GlobalContext = { 
  loggedIn: boolean;
  memberData?: DBMemberDataExtended;
  selectedTheme: "light" | "dark";
  toggleTheme: (theme?: "light" | "dark") => void;
  toggleLoader: (state: boolean) => void;
  toggleNotification: (state: boolean, data?: Notification) => void;
  copyToClipboard: (string: string) => void;
}

export const globalContext = React.createContext<Partial<GlobalContext>>({});