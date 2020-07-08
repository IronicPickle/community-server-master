import { Request, NextFunction, Response } from "express";
import csurf from "csurf";
import members from "../models/members";
import { config } from "./Config";
import { backendConfig } from "./BackendConfig";

const csrfProtection = (process.env.NODE_ENV === "production") ? csurf() : null;

export default function authenticator(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {

    if(req.headers.authorization) {
      if(!checkToken(req.headers.authorization)) {
        return next({ code: "UNAUTHORISED" });
      }
    } else {
      if(!await check(req.user, requiredPermission)) {
        return next({ code: "UNAUTHORISED" });
      }
      if(csrfProtection) return csrfProtection(req, res, next);
  
    }
    return next();
  }
}

async function check(user?: { [key: string]: any }, requiredPermString?: string): Promise<boolean> {

  if(!user) return false;

  const member = await members.findById(user._id);

  if(!member) return false;

  if(requiredPermString) {
    const requiredPerm = config.permissions[requiredPermString];

    return member.discordPerms.includes(requiredPerm);
  }

  return true;

}

function checkToken(token?: string): boolean {

  if(!token) return false;
  if(!token.startsWith("Bearer ")) return false;

  return backendConfig.companion.token === token.substr(7);

}