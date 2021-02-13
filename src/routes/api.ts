import express, { Request, Response, NextFunction } from "express";
import Members from "../models/Members";
import wrap from "../utils/wrap";
import Validation from "../utils/Validation";
import mongoose from "mongoose";
import HTTPNotify from "../http_utils/HTTPNotify";
import Config, { config, PermissionString } from "../utils/Config";
import HTTPMembers from "../http_utils/HTTPMembers";
import authenticator from "../utils/authenticator";

const router = express.Router();

router.get("/config/query", authenticator("query-config") ,wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  
  let success = true;
  let msg = "Query successful";

  res.status((success) ? 200 : 404).send({ success, msg, data: { config } });

}));

router.patch("/config/edit", authenticator("edit-config"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const action = <string> req.body.action;
  const perm = <PermissionString> req.body.perm;

  let success = true;
  let msg = "Edit successful";

  config.permissions[action] = perm;
  Config.save();
  
  res.status((success) ? 200 : 404).send({ success, msg });

}));

router.get("/members/query", authenticator("query-members"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const query = <{
    searchKey: string,
    searchQuery: string,
    sortKey: string,
    sortDirection: "1" | "0" | "-1",
    snipStart: string,
    snipLimit: string,
    stage: "0" | "1" | "2" | "3"
  }> req.query;

  let success = true;
  let msg = "Query successful";

  let search: { [key: string]: any } = {};
  let sort: { [key: string]: -1 | 0 | 1 } = {};
  let snipStart: number = 0;
  let snipLimit: number = 0;

  const whitelisted = [ "discordId", "discordName", "inaraName", "inGameName", "joinedSquadron", "joinedInaraSquadron", "applicationStatus.stage" ];
  const strings = [ "discordId", "discordName", "inaraName", "inGameName" ];

  const searchKey = query.searchKey;
  const searchQuery = query.searchQuery;
  if(whitelisted.includes(searchKey) && searchQuery) {
    if(strings.includes(searchKey)) search[searchKey] = new RegExp(searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi");
  }

  const sortKey = query.sortKey;
  const sortDirection = query.sortDirection;
  if(whitelisted.includes(sortKey) && [-1, 0, 1].includes(parseInt(sortDirection))) sort[sortKey] = <-1 | 0 | 1> parseInt(sortDirection);

  if(!isNaN(parseInt(query.snipStart))) snipStart = parseInt(query.snipStart);
  if(!isNaN(parseInt(query.snipLimit))) snipLimit = parseInt(query.snipLimit);

  if([0, 1, 2, 3].includes(parseInt(query.stage))) search = { "applicationStatus.stage": parseInt(query.stage), ...search }

  const count = await Members.countDocuments(search);
  const members: any[] = await Members.find(search).sort(sort).skip(snipStart).limit(snipLimit).lean();

  for(const i in members) {
    const requests = members[i].revisionMessages;
    for(const ii in requests) {
      const request = requests[ii];
      const authorMember = await Members.findById(request.authorId);
      if(authorMember) {
        members[i].revisionMessages[ii].author = authorMember;
      }
    }
  }

  if(members.length === 0) {
    success = false; msg = "No data matched query";
  }

  res.status((success) ? 200 : 404).send({ success, msg, data: { count, members } });

}));

router.get("/members/queryStats", authenticator("query-member-stats"), authenticator("create-member"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  
  const totalMembers = await Members.find().countDocuments();
  const totalMembers0 = await Members.find({ "applicationStatus.stage": 0 }).countDocuments();
  const totalMembers1 = await Members.find({ "applicationStatus.stage": 1 }).countDocuments();
  const totalMembers2 = await Members.find({ "applicationStatus.stage": 2 }).countDocuments();
  const totalMembers3 = await Members.find({ "applicationStatus.stage": 3 }).countDocuments();

  const revisions = await Members.find({ "revisionMessages.0": { "$exists": true } }, "revisionMessages");
  let totalRevisions = 0;
  for(const i in revisions) {
    const revisionMessages = revisions[i].revisionMessages;
    for(const ii in revisionMessages) {
      totalRevisions += 1;
    }
  }

  const discordStats = await HTTPMembers.queryStats();

  const data = {
    totalMembers, totalMembers0, totalMembers1, totalMembers2, totalMembers3,
    totalRevisions, ...discordStats.data
  }

  res.status(200).send({ success: true, msg: "Query successful", data });

}));

router.post("/members/create", authenticator("create-member"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const inputs = <{
    discordId: string,
    inaraName: string,
    inGameName: string
  }> req.body.inputs;
  const { discordId, inaraName, inGameName } = inputs;

  let success = true;
  let msg = "New member created";

  const errors: { [key: string]: any } = {
    discordId: await Validation.discordId(discordId),
    inaraName: Validation.inaraName(inaraName),
    inGameName: Validation.inGameName(inGameName)
  }

  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }

  const resp = await HTTPMembers.query(discordId);
  if(!resp.success || !resp.data) {
    success = false; errors.discordId = "Member not found in guild";
  }

  if(success && resp.data) {
    const member = resp.data.members[0];
    const discordName = member.displayName;
    const discordPerms = member.perms;
    const discordRoles = member.roles;
    const discordAvatar = member.avatar;
    
    const newMember = new Members({
      discordId, discordName, discordPerms, discordRoles, discordAvatar,
      inaraName, inGameName
    });
    await newMember.save();
  } else {
    msg = "Some details were invalid";
  }

  res.status((success) ? 200 : 400).send({ success, msg, errors });

}));

router.patch("/members/update", authenticator("update-member"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;

  let success = true;
  let msg = "Update successful";

  const member = await Members.findById(_id);
  if(member) {

    const resp = await HTTPMembers.query(member.discordId);
    if(resp.success && resp.data) {
      const member = resp.data.members[0];
      const discordName = member.displayName;
      const discordPerms = member.perms;
      const discordRoles = member.roles;
      const discordAvatar = member.avatar;

        await Members.updateOne({ _id }, {
        discordName, discordPerms, discordRoles, discordAvatar
      });
    } else {
        success = false; msg = "Member not found in guild";
      }

  } else {
    success = false; msg = "Member not found in database";
  }

  res.status((success) ? 200 : 400).send({ success, msg });

}));
  
export default router;