import express, { Request, Response, NextFunction } from "express";
import http from "http";
import wrap from "../utils/wrap";
import passport from "passport";
import Members, { Member } from "../models/Member";
import { config } from "../utils/Config";
import { backendConfig } from "../utils/BackendConfig";
import authenticator from "../utils/authenticator";


export default (httpInstance: http.Server) => {
  const router = express.Router();

  router.get("/login", passport.authenticate("discord"));

  router.get("/logout", wrap(async (req: Request, res: Response, next: NextFunction) => {
    req.logOut();

    res.redirect("/");
  }));

  interface MemberExtended {
    webPerms: { [key: string]: boolean } | null;
    revisionMessages: {
      _id: string;
      text: string;
      authorId: string;
      creationDate: Date;
      author: {
        discordId: string,
        discordName: string,
        discordAvatar?: string
      }
    }[];
  }

  router.get("/check", wrap(async (req: Request, res: Response, next: NextFunction) => {
    let success = true;
    let msg = "Authentication check successful";

    let member: Member & MemberExtended | null = null;

    if(!req.user) {
      success = false; msg = "Authenciation check failed";
    } else {
      const user: any = req.user;
      member = await Members.findById(user._id).lean();
    }

    if(member) {
      const perms: { [key: string]: boolean } = {}
      for(const i in config.permissions) {
        const perm = config.permissions[i];
        perms[i] = <boolean> await authenticator(i)(req, res);
      }
      member.webPerms = perms;
    } else {
      success = false; msg = "Member no longer exists in database";
    }

    res.status((success) ? 200 : 401).send({ success, msg, data: { member } });

  }));

  router.get("/discord/callback", passport.authenticate("discord", {
    failureRedirect: "/"
  }), wrap(async (req: Request, res: Response, next: NextFunction) => {
    res.redirect(((process.env.NODE_ENV !== "production" && backendConfig.devUrl) ? backendConfig.devUrl : "/"));
  }));

  return router;    
}