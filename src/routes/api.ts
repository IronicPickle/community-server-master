import express, { Request, Response, NextFunction } from "express";
import { login } from "../utils/auth";
import Members from "../models/members";
import wrap from "../utils/wrap";
import validation from "../utils/validation";
import mongoose from "mongoose";

const router = express.Router();

router.get("/members/query", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const members = await Members.find();

  res.status(200).send({ success: true, msg: "Query successful", data: members });

}));

router.get("/members/stats", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const total = await Members.find().count();
  const total0 = await Members.find({ "applicationStatus.stage": 0 }).count();
  const total1 = await Members.find({ "applicationStatus.stage": 1 }).count();
  const total2 = await Members.find({ "applicationStatus.stage": 2 }).count();

  const names = await Members.find({}, "inaraName inGameName");
  let totalInara = 0;
  let totalInGame = 0;
  for(const i in names) {
    if(names[i].inaraName.length > 0) totalInara += 1;
    if(names[i].inGameName.length > 0) totalInGame += 1;
  }
  const totalGroup = await Members.find({ joinedPrivateGroup: true }).count();

  const revisions = await Members.find({ "revisionMessages.0": { "$exists": true } }, "revisionMessages");
  let totalRevisions = 0;
  for(const i in revisions) {
    const revisionMessages = revisions[i].revisionMessages;
    for(const ii in revisionMessages) {
      totalRevisions += 1;
    }
  }

  const data = { total, total0, total1, total2, totalInara, totalInGame, totalGroup, totalRevisions }

  res.status(200).send({ success: true, msg: "Query successful", data });

}));

router.post("/members/create", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const inputs = req.body.inputs;
  const { discordId, inaraName, inGameName } = inputs;

  let success = true;
  let msg = "New member created";

  const errors: { [key: string]: any } = {
    discordId: await validation.discordId(discordId),
    inaraName: validation.inaraName(inaraName),
    inGameName: validation.inGameName(inGameName)
  }

  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }

  if(success) {
    const newMember = new Members({
      discordId, inaraName, inGameName
    });
    await newMember.save();
  } else {
    msg = "Some details were invalid";
  }

  res.status((success) ? 200 : 400).send({ success, msg, errors });

}));

router.post("/members/edit", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const _id = req.body._id;
  const inputs = req.body.inputs;
  const { inaraName, inGameName, joinedPrivateGroup } = inputs;

  let success = true;
  let msg = "Edit successful";

  const member = await Members.findById(_id);
  if(member) {

    const errors: { [key: string]: any } = {
      inaraName: validation.inaraName(inaraName),
      inGameName: validation.inGameName(inGameName),
      joinedPrivateGroup: validation.joinedPrivateGroup(joinedPrivateGroup)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    if(success && member.applicationStatus.stage !== 2) {
      await Members.updateOne({ _id }, { inaraName, inGameName, joinedPrivateGroup });
    } else if(!success) {
      msg = "Some details were invalid";
    } else {
      success = false; msg = "Member's application state cannot be 'Completed'";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }

}));

router.post("/members/complete", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const _id = req.body._id;

  let success = true;
  let msg = "Application completed";

  const member = await Members.findById(_id);
  if(member) {
    if(
      member.applicationStatus.stage === 1 &&
      member.joinedPrivateGroup &&
      member.inaraName.length > 0 &&
      member.inGameName.length > 0
    ) {
      await Members.updateOne({ _id }, { "applicationStatus.stage": 2 });
    } else if(member.applicationStatus.stage !== 1) {
      success = false;  msg = "Member's application state must be 'In Progress'";
    } else {
      success = false; msg = "Member's details are not sufficient";
    }
  } else {
    success = false; msg = "Member not found";
  }

  res.status(200).send({ success, msg });

}));

router.post("/members/revert", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const _id = req.body._id;

  let success = true;
  let msg = "Application reverted";

  const member = await Members.findById(_id);
  if(member) {
    if(member.applicationStatus.stage === 2) {
      await Members.updateOne({ _id }, { "applicationStatus.stage": 1 });
    } else {
      success = false; msg = "Member's application state must be 'Completed'";
    }
  } else {
    success = false; msg = "Member not found";
  }

  res.status(200).send({ success, msg });

}));

router.post("/members/request", wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
  const _id = req.body._id;
  const { message } = req.body.inputs;

  let success = true;
  let msg = "Revision request sent";

  const errors: { [key: string]: any } = {
    message: validation.message(message)
  }

  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }

  const member = await Members.findById(_id);
  if(member) {
    if(success && member.applicationStatus.stage === 1) {
      member.revisionMessages.push({ _id: new mongoose.Types.ObjectId, text: message, date: new Date() });
      await Members.updateOne({ _id }, { revisionMessages: member.revisionMessages });
    } else if(!success) {
      msg = "Some details were invalid";
    } else {
      success = false; msg = "Member's application state must be 'In Progress'";
    }
  } else {
    success = false; msg = "Member not found";
  }

  res.status((success) ? 200 : 400).send({ success, msg, errors });

}));

router.post("/login", wrap(async (req: Request, res: Response, next: NextFunction) => {
  const password = req.body.inputs.password;

  let msg = "";
  
  const errors: { [key: string]: any } = {
    password: login(password)
  }

  let success = true;
  for(const i in errors) {
    if(Object.keys(errors[i]).length > 0) success = false;
  }

  if(success) {
    msg = "Login successful";
  } else {
    msg = "Some details were invalid";
  }

  res.status((success) ? 200 : 400).send({ success, msg, errors });

}));
  
export default router;