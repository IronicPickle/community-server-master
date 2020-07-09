import express, { Request, Response, NextFunction } from "express";
import Members from "../models/Members";
import wrap from "../utils/wrap";
import Validation from "../utils/Validation";
import mongoose from "mongoose";
import HTTPNotify from "../http_utils/HTTPNotify";
import Config, { config, PermissionString } from "../utils/Config";
import Missions, { MissionsI } from "../models/Missions";
import HTTPMissions from "../http_utils/HTTPMissions";
import HTTPBGS from "../http_utils/HTTPBGS";
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

router.get("/missions/query", authenticator("query-missions"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const query = <{
    snipStart: string
  }> req.query;

  let success = true;
  let msg = "Query successful";

  let snipStart: number = 0;

  if(!isNaN(parseInt(query.snipStart))) snipStart = parseInt(query.snipStart);

  const missions: MissionsI[] = await Missions.find().sort({ creationDate: -1 }).skip(snipStart).limit(10).lean();
  const count: number = await Missions.find().countDocuments();

  if(missions.length === 0) {
    success = false; msg = "No data matched query";
  }

  res.status((success) ? 200 : 404).send({ success, msg, data: { missions, count } });

}));

router.post("/missions/broadcast", authenticator("broadcast-mission"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const authorDiscordId = <string> req.body.authorDiscordId;
  const inputs = <{
    description: string,
    objectives: string[]
  }> req.body.inputs;
  const { description, objectives } = inputs;

  let success = true;
  let msg = "New mission broadcasted";

  const errors: { [key: string]: any } = {
    description: Validation.description(description),
    objectives: Validation.objectives(objectives)
  }

  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }
  const authorMember = await Members.findOne({ discordId: authorDiscordId });
  if(authorMember && success) {
    const authorId = authorMember._id;
    const bgsResp = await HTTPBGS.query();
    if(bgsResp.success && bgsResp.data) {
      const factionsData = bgsResp.data.factionsData;
      const resp = await HTTPMissions.broadcast(authorMember.discordId, factionsData, { description, objectives });
      if(resp.success) {
        const newMission = new Missions({
          description, objectives, authorId, factionsData
        });
        await newMission.save();
      } else {
        success = false; msg = resp.msg;
      }
    } else {
      success = false; msg = bgsResp.msg;
    }
  } else if(!success) {
    msg = "Some details were invalid";
  } else {
    success = false; msg = "Author not found in database";
  }

  res.status((success) ? 200 : 400).send({ success, msg, errors });

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

router.post("/members/createRevisionRequest", authenticator("create-revision-request"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;
  const authorDiscordId = <string> req.body.authorDiscordId;
  const inputs = <{
    message: string
  }> req.body.inputs;
  const { message } = inputs;

  let success = true;
  let msg = "Revision request sent";

  const errors: { [key: string]: any } = {
    message: Validation.message(message)
  }

  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }

  const member = await Members.findById(_id);
  if(member) {
    const stage = member.applicationStatus.stage
    const authorMember = await Members.findOne({ discordId: authorDiscordId });
    if(authorMember) {
      if(success && (stage === 1 || stage === 2)) {
        const resp = await HTTPNotify.revisionRequest(member.discordId, authorMember.discordId, { message });
        if(resp.success) {
          member.revisionMessages.push({ _id: new mongoose.Types.ObjectId, text: message, authorId: authorMember._id, creationDate: new Date() });
          await Members.updateOne({ _id }, { revisionMessages: member.revisionMessages });
          if(stage === 1) {
            await Members.updateOne({ _id }, { "applicationStatus.stage": 2, "applicationStatus.reviewedBy": authorMember._id });
          }
        } else {
          success = false; msg = resp.msg;
        }
      } else if(!success) {
        msg = "Some details were invalid";
      } else {
        success = false; msg = "Member's application state must be 'In Progress' or 'Reviewed'";
      }
    } else {
      success = false; msg = "Author not found in database";
    }
  } else {
    success = false; msg = "Member not found in database";
  }

  res.status((success) ? 200 : 400).send({ success, msg, errors });

}));

router.patch("/members/edit", authenticator("edit-member"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;
  const authorDiscordId = <string> req.body.authorDiscordId;
  const inputs = <{
    inaraName: string,
    inGameName: string,
    joinedSquadron: boolean,
    joinedInaraSquadron: boolean
  }> req.body.inputs;
  const { inaraName, inGameName, joinedSquadron, joinedInaraSquadron } = inputs;

  let success = true;
  let msg = "Edit successful";

  const errors: { [key: string]: any } = {
    inaraName: Validation.inaraName(inaraName),
    inGameName: Validation.inGameName(inGameName),
    joinedSquadron: Validation.joinedSquadron(Boolean(joinedSquadron)),
    joinedInaraSquadron: Validation.joinedInaraSquadron(Boolean(joinedInaraSquadron))
  }

  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }

  const member = await Members.findById(_id);
  if(member) {
    const authorMember = await Members.findOne({ discordId: authorDiscordId });

    const resp = await HTTPMembers.query(member.discordId);
    if(success && resp.data) {
      const stage = member.applicationStatus.stage;
      if(stage !== 3) {
        const discordMember = resp.data.members[0];
        const discordName = discordMember.displayName;
        const discordPerms = discordMember.perms;
        const discordRoles = discordMember.roles;
        const discordAvatar = discordMember.avatar;
        
        await Members.updateOne({ _id }, {
          discordName, discordPerms, discordRoles, discordAvatar,
          inaraName, inGameName, joinedSquadron, joinedInaraSquadron
        });
  
        if(stage === 1 && authorMember) {
          await Members.updateOne({ _id }, { "applicationStatus.stage": 2, "applicationStatus.reviewedBy": authorMember._id });
        }
      } else {
        success = false; msg = "Member's application state cannot be 'Completed'";
      }
    } else if(!success) {
      msg = "Some details were invalid";
    } else {
      success = false; errors.discordId = "Member not found in guild";
    }
  } else {
    success = false; msg = "Member not found in database";
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

router.patch("/members/startApplication", authenticator("start-application"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;

  let success = true;
  let msg = "Application started";

  const member = await Members.findById(_id);
  if(member) {
    const stage = member.applicationStatus.stage;
    const resp = await HTTPNotify.applicationStart(member.discordId);
    if(resp.success) {
      if(stage === 0) {
        await Members.updateOne({ _id }, { "applicationStatus.stage": 1, "applicationStatus.startDate": new Date() });
      } else {
        success = false;  msg = "Member's application state must be 'Not Started'";
      }
    } else {
      success = false; msg = resp.msg;
    }
  } else {
    success = false; msg = "Member not found in database";
  }

  res.status(200).send({ success, msg });

}));

router.patch("/members/sendApplicationWarning", authenticator("warning-application"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;

  let success = true;
  let msg = "Warning successful";

  const member = await Members.findById(_id);
  if(member) {

    const startDate = member.applicationStatus.startDate;
    if(startDate) {

      const resp = await HTTPNotify.applicationWarning(member.discordId,startDate);
      if(resp.success) {

        const stage = member.applicationStatus.stage;
        if(stage !== 0) {

          await Members.updateOne({ _id }, {
            "applicationStatus.warningSent": true
          });
        } else {
          success = false;  msg = "Member's application state must not be 'Not Started'";
        }
      } else {
        success = false; msg = resp.msg;
      }
    } else {
      success = false; msg = "Member has no start date";
    }
  } else {
    success = false; msg = "Member not found in database";
  }

  res.status(200).send({ success, msg });

}));

router.patch("/members/resetApplication", authenticator("reset-application"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;

  let success = true;
  let msg = "Application reset";

  const member = await Members.findById(_id);
  if(member) {

    const startDate = member.applicationStatus.startDate;
    if(startDate) {

      const resp = await HTTPNotify.applicationReset(member.discordId, startDate);
      if(resp.success) {

        const stage = member.applicationStatus.stage;
        if(stage !== 0) {

          await Members.updateOne({ _id }, {
            "applicationStatus.stage": 0,
            "applicationStatus.reviewedById": undefined,
            "applicationStatus.completedById": undefined,
            "applicationStatus.revertedById": undefined,
            "applicationStatus.warningSent": false,
            joinedSquadron: false,
            joinedInaraSquadron: false,
            inaraName: undefined,
            inGameName: undefined,
            revisionMessages: []
          });
        } else {
          success = false;  msg = "Member's application state must not be 'Not Started'";
        }
      } else {
        success = false; msg = resp.msg;
      }
    } else {
      success = false; msg = "Member has no start date";
    }
  } else {
    success = false; msg = "Member not found in database";
  }

  res.status(200).send({ success, msg });

}));

router.patch("/members/completeApplication", authenticator("complete-application"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;
  const authorDiscordId = <string> req.body.authorDiscordId;

  let success = true;
  let msg = "Application completed";

  const member = await Members.findById(_id);
  if(member) {
    const stage = member.applicationStatus.stage;
    const authorMember = await Members.findOne({ discordId: authorDiscordId });
    if(authorMember) {
      if(
        stage === 2 &&
        member.joinedSquadron &&
        member.joinedInaraSquadron &&
        member.inaraName.length > 0 &&
        member.inGameName.length > 0
      ) {
        const resp = await HTTPNotify.applicationComplete(member.discordId, authorDiscordId);
        if(resp.success) {
          await Members.updateOne({ _id }, { "applicationStatus.stage": 3, "applicationStatus.completedById": authorMember._id });
        } else {
          success = false; msg = resp.msg;
        }
      } else if(stage !== 2) {
        success = false;  msg = "Member's application state must be 'Reviewed'";
      } else {
        success = false; msg = "Member's details are not sufficient";
      }
    } else {
      success = false; msg = "Author not found in database";
    }
  } else {
    success = false; msg = "Member not found in database";
  }

  res.status(200).send({ success, msg });

}));

router.patch("/members/revertApplication", authenticator("revert-application"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

  const _id = <string> req.body._id;
  const authorDiscordId = <string> req.body.authorDiscordId;

  let success = true;
  let msg = "Application reverted";

  const member = await Members.findById(_id);
  if(member) {
    const stage = member.applicationStatus.stage;
    const authorMember = await Members.findOne({ discordId: authorDiscordId });
    if(authorMember) {
      if(stage === 3) {
        const resp = await HTTPNotify.applicationRevert(member.discordId, authorDiscordId);
        if(resp.success) {
          await Members.updateOne({ _id }, { "applicationStatus.stage": 2, "applicationStatus.revertedById": authorMember._id });
        } else {
          success = false; msg = resp.msg;
        }
      } else {
        success = false; msg = "Member's application state must be 'Completed'";
      }
    } else {
      success = false; msg = "Author not found in database";
    }
  } else {
    success = false; msg = "Member not found in database";
  }

  res.status(200).send({ success, msg });

}));
  
export default router;