import { Request, NextFunction, Response } from "express";
import csurf from "csurf";
import Members from "../models/Member";
import { config } from "./Config";
import { backendConfig } from "./BackendConfig";

const csrfProtection = (process.env.NODE_ENV === "production") ? csurf() : null;

export default function authenticator(requiredPermission: string) {
  return async (req: Request, res: Response, next?: NextFunction) => {

    const headers = req.headers || {};
    if(headers.authorization) {
      if(!checkToken(req.headers.authorization)) {
        if(next != null) {
          return next({ code: "UNAUTHORISED" });
        } else {
          return false;
        }
      }
    } else {
      if(!await check(req.user, requiredPermission)) {
        if(next != null) {
          return next({ code: "UNAUTHORISED" });
        } else {
          return false;
        }
      }
      if(csrfProtection != null && next != null) return csrfProtection(req, res, next);
  
    }
    if(next != null) {
      return next();
    } else {
      return true;
    }
  }
}

async function check(user?: { [key: string]: any }, requiredPermString?: string): Promise<boolean> {

  if(requiredPermString != null) {
    const requiredPerm = config.permissions[requiredPermString];
    if(requiredPerm === "ANYONE") return true;

    if(!user) return false;
    const member = await Members.findById(user._id);
    if(!member) return false;

    return member.discordPerms.includes(requiredPerm);
  }

  return true;

}

function checkToken(token?: string): boolean {

  if(!token) return false;
  if(!token.startsWith("Bearer ")) return false;

  return backendConfig.token === token.substr(7);

}