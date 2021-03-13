import express, { Request, Response, NextFunction } from "express";
import http from "http";
import Members, { Member } from "../models/Member";
import NewsPosts, { NewsPost } from "../models/NewsPost";
import Servers, { Server, ServerType } from "../models/Server";
import wrap from "../utils/wrap";
import Validation from "../utils/Validation";
import Config, { config, PermissionString } from "../utils/Config";
import HTTPMembers from "../http_utils/HTTPMembers";
import authenticator from "../utils/authenticator";
import HTTPServers from "../http_utils/HTTPServers";
import ServerPosts, { ServerPost } from "../models/ServerPost";
import HTTPNewsPosts from "../http_utils/HTTPNewsPost";
import Gamedig from "gamedig";

type NewsPostExtended = NewsPost & { author?: Member }

export default (httpInstance: http.Server) => {
  const router = express.Router();

  router.get("/config/query", authenticator("query-config"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
    
    let success = true;
    let msg = "Query Successful";

    res.status((success) ? 200 : 404).send({ success, msg, data: { config } });

  }));

  router.patch("/config/edit", authenticator("edit-config"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const action = <string> req.body.action;
    const perm = <PermissionString> req.body.perm;

    let success = true;
    let msg = "Edit Successful";

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
      snipLimit: string
    }> req.query;

    let success = true;
    let msg = "Query Successful";

    let search: { [key: string]: any } = {};
    let sort: { [key: string]: -1 | 0 | 1 } = {};
    let snipStart: number = 0;
    let snipLimit: number = 0;

    const whitelisted = [ "discordId", "discordName", "joinDate" ];
    const strings = [ "discordId", "discordName" ];

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

    const count = await Members.countDocuments(search);
    const members: Member[] = await Members.find(search).sort(sort).skip(snipStart).limit(snipLimit).lean();

    if(members.length === 0) {
      success = false; msg = "No data matched query";
    }

    res.status((success) ? 200 : 404).send({ success, msg, data: { count, members } });

  }));

  router.get("/members/queryStats", authenticator("query-member-stats"), authenticator("create-member"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed
    
    const totalMembers = await Members.find().countDocuments();

    const discordStats = await HTTPMembers.queryStats();

    const data = {
      totalMembers, ...discordStats.data
    }

    res.status(200).send({ success: true, msg: "Query successful", data });

  }));

  router.post("/members/create", authenticator("create-member"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const inputs = <{
      discordId: string
    }> req.body.inputs;
    const { discordId } = inputs;

    let success = true;
    let msg = "Created Member";

    const errors: { [key: string]: any } = {
      discordId: await Validation.discordId(discordId)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    const resp = await HTTPMembers.query(discordId);
    if(!resp.success || resp.data == null) {
      success = false; errors.discordId = "Member not found in guild";
    }

    if(success && resp.data != null) {
      const member = resp.data.members[0];
      const discordName = member.displayName;
      const discordPerms = member.perms;
      const discordRoles = member.roles;
      const discordAvatar = member.avatar;
      
      const newMember = new Members({
        discordId, discordName, discordPerms, discordRoles, discordAvatar
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
    let msg = "Updated Member";

    const member = await Members.findById(_id);
    if(member) {

      const resp = await HTTPMembers.query(member.discordId);
      if(resp.success && resp.data != null) {
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



  router.get("/newsPosts/query", authenticator("query-newsposts"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const query = <{
      searchKey: string,
      searchQuery: string,
      sortKey: string,
      sortDirection: "1" | "0" | "-1",
      snipStart: string,
      snipLimit: string
    }> req.query;

    let success = true;
    let msg = "Query Successful";

    let search: { [key: string]: any } = {};
    let sort: { [key: string]: -1 | 0 | 1 } = {};
    let snipStart: number = 0;
    let snipLimit: number = 0;

    const whitelisted = [ "authorDiscordId", "title", "body", "datePosted" ];
    const strings = [ "authorDiscordId", "title", "body", "datePosted" ];

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

    const count = await NewsPosts.countDocuments(search);
    const newsPosts: NewsPostExtended[] = await NewsPosts.find(search).sort(sort).skip(snipStart).limit(snipLimit).lean();

    for(const i in newsPosts) {
      const author = await Members.findById(newsPosts[i].authorId);
      if(author == null) continue;
      newsPosts[i].author = author;
    }

    res.status((success) ? 200 : 404).send({ success, msg, data: { count, newsPosts } });

  }));

  router.post("/newsPosts/create", authenticator("create-newspost"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const inputs = <{
      title: string,
      body: string
    }> req.body.inputs;
    const { title, body } = inputs;

    const user = <Member | null> req.user;
    if(user == null) return;

    let success = true;
    let msg = "Post Created";

    const errors: { [key: string]: any } = {
      title: Validation.postTitle(title),
      body: Validation.postBody(body)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    const resp = await HTTPMembers.query(user.discordId);
    if(!resp.success || resp.data == null) {
      success = false; errors.discordId = "Member not found in guild";
    }

    if(success && resp.data != null) {
      const authorId = user._id;
      const authorDiscordId = user.discordId;
      
      const newNewsPost = new NewsPosts({
        authorId, authorDiscordId, title, body
      });
      const newsPost = await newNewsPost.save();
      const resp = await HTTPNewsPosts.create(<NewsPost> newsPost.toObject());
      if(resp.data?.messageId != null) {
        await NewsPosts.findByIdAndUpdate(newsPost._id, { messageId: resp.data.messageId }, { new: true })
      }
    } else {
      msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));

  router.patch("/newsPosts/edit", authenticator("create-newspost"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const inputs = <{
      _id: string,
      title: string,
      body: string
    }> req.body.inputs;
    const { _id, title, body } = inputs;

    let success = true;
    let msg = "Post Updated";

    const errors: { [key: string]: any } = {
      title: Validation.postTitle(title),
      body: Validation.postBody(body)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    if(success) {
      
      const newsPost = await NewsPosts.findByIdAndUpdate(_id, { title, body }, { new: true });
      if(newsPost != null) {
        await HTTPNewsPosts.edit(<NewsPost> newsPost.toObject());
      } else {
        errors._id = "News Post not found in database";
        success = false; msg = "Some details were invalid";
      }

    } else {
      msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));

  router.delete("/newsPosts/delete", authenticator("create-newspost"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const query = <{
      _id: string
    }> req.query;

    const { _id } = query;

    let success = true;
    let msg = "Post Deleted";

    const errors: { [key: string]: any } = {}

    const newsPost = await NewsPosts.findByIdAndDelete(_id);
    if(newsPost != null) {
      await HTTPNewsPosts.delete({ messageId: newsPost.messageId || "" });
    } else {
      errors._id = "News Post not found in database";
      success = false; msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));
  


  router.get("/servers/status", authenticator("status-servers"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const query = <{ serverId: string }> req.query;
    const { serverId } = query;

    let success = true;
    let msg = "Query Successful";

    let result: Gamedig.QueryResult | null = null;

    const server = await Servers.findById(serverId);
    if(server != null) {
      let port: number | undefined = parseInt(server.port);
      if(isNaN(port)) port = undefined;
      try {
        result = await Gamedig.query({
          type: server.type,
          host: server.address,
          port
        });
        result.players.map((_, i) => delete result?.players[i].address);
        result.bots.map((_, i) => delete result?.bots[i].address);
      } catch {
        success = false; msg = "Couldn't contact server";
      }
    } else {
      success = false; msg = "Server not found in database";
    }

    res.status((success) ? 200 : 404).send({ success, msg, data: { result } });

  }));

  router.get("/servers/query", authenticator("query-servers"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    let success = true;
    let msg = "Query Successful";

    const count = await Servers.countDocuments();
    const servers = await Servers.find({});

    res.status((success) ? 200 : 404).send({ success, msg, data: { count, servers } });

  }));

  router.post("/servers/create", authenticator("create-server"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const inputs = <{
      type: ServerType,
      name: string,
      description: string,
      address: string,
      port: string
    }> req.body.inputs;
    const { type, name, description, address, port } = inputs;

    const user = <Member | null> req.user;
    if(user == null) return;

    let success = true;
    let msg = "Server Created";

    const errors: { [key: string]: any } = {
      type: Validation.serverType(type),
      name: Validation.serverName(name),
      description: Validation.serverDescription(description),
      address: Validation.serverAddress(address),
      port: Validation.serverPort(port)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    if(success) {
      const newServer = new Servers({
        type, name, description, address, port
      });
      const server = await newServer.save();
      const resp = await HTTPServers.create(<Server> server.toObject());
      if(resp.data?.channelId != null) {
        await Servers.findByIdAndUpdate(
          server._id, { channelId: resp.data.channelId, messageId: resp.data.messageId }, { new: true }
        );
      }
    } else {
      msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));

  router.patch("/servers/edit", authenticator("create-server"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const inputs = <{
      _id: string,
      type: string,
      name: string,
      description: string,
      address: string,
      port: string
    }> req.body.inputs;
    const { _id, type, name, description, address, port } = inputs;

    let success = true;
    let msg = "Server Updated";

    const errors: { [key: string]: any } = {
      type: Validation.serverType(type),
      name: Validation.serverName(name),
      description: Validation.serverDescription(description),
      address: Validation.serverAddress(address),
      port: Validation.serverPort(port)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    if(success) {
      
      const server = await Servers.findByIdAndUpdate(
        _id, { type: <ServerType> type, name, description, address, port }, { new: true }
      );
      if(server != null) {
        await HTTPServers.edit(<Server> server.toObject());
      } else {
        errors._id = "Server not found in database";
        success = false; msg = "Some details were invalid";
      }

    } else {
      msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));

  router.delete("/servers/delete", authenticator("create-newspost"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const query = <{
      _id: string
    }> req.query;

    const { _id } = query;

    let success = true;
    let msg = "Server Deleted";

    const errors: { [key: string]: any } = {}

    const server = await Servers.findByIdAndDelete(_id);
    if(server != null) {
      await HTTPServers.delete({ channelId: server.channelId || "" });
    } else {
      errors._id = "Server not found in database";
      success = false; msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));

  router.post("/servers/createPost", authenticator("create-serverpost"), wrap(async (req: Request, res: Response, next: NextFunction) => { // Must be authed

    const inputs = <{
      title: string,
      body: string,
      serverId: string
    }> req.body.inputs;
    const { title, body, serverId } = inputs;

    const user = <Member | null> req.user;
    if(user == null) return;

    let success = true;
    let msg = "Post Created";

    const errors: { [key: string]: any } = {
      title: Validation.postTitle(title),
      body: Validation.postBody(body)
    }

    for(const i in errors) {
      if(Object.keys(errors[i]).length > 0) success = false;
    }

    const server = await Servers.findById(serverId);
    if(server == null) {
      success = false; errors.serverId = "Server not found in database";
    }

    const resp = await HTTPMembers.query(user.discordId);
    if(!resp.success || resp.data == null) {
      success = false; errors.discordId = "Member not found in guild";
    }

    if(success && resp.data != null) {
      const authorId = user._id;
      const authorDiscordId = user.discordId;
      
      const newServerPost = new ServerPosts({
        authorId, authorDiscordId, title, body
      });
      const serverPost = await newServerPost.save();
      if(server != null) {
        const resp = await HTTPServers.createPost(<ServerPost & { channelId: string }> { ...serverPost.toObject(), channelId: server.channelId });
        if(resp.data?.messageId != null) {
          await ServerPosts.findByIdAndUpdate(serverPost._id, { messageId: resp.data.messageId }, { new: true })
        }
      }
    } else {
      msg = "Some details were invalid";
    }

    res.status((success) ? 200 : 400).send({ success, msg, errors });

  }));

  return router;
}