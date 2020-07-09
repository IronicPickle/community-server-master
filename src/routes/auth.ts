import express, { Request, Response, NextFunction } from "express";
import wrap from "../utils/wrap";
import passport from "passport";
import Members, { MembersI } from "../models/Members";
import { config } from "../utils/Config";
import { backendConfig } from "../utils/BackendConfig";

const router = express.Router();

router.get("/login", passport.authenticate("discord"));

router.get("/logout", wrap(async (req: Request, res: Response, next: NextFunction) => {
  req.logOut();

  res.redirect("/");
}));

interface MembersExtendedI {
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

  let member: MembersI & MembersExtendedI | null = null;

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
      perms[i] = member.discordPerms.includes(perm)
    }
    member.webPerms = perms;

    const requests = member.revisionMessages;
    for(const i in requests) {
      const request = requests[i];
      const authorMember = await Members.findById(request.authorId, "discordId discordName discordAvatar");
      if(authorMember) member.revisionMessages[i].author = authorMember;
    }
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
  
export default router;