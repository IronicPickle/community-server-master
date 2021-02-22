import http from "http";
import socketIo from "socket.io";
import reqPromise from "request-promise";
import { logger } from "../../../app";
import { backendConfig } from "../../../utils/BackendConfig";
import session from "express-session";
import authenticator from "../../../utils/authenticator";

export type SocketExtended = socketIo.Socket & {
  handshake: {
    session?: session.Session & Partial<session.SessionData> & {
      passport: { user?: Express.User }
    };
    sessionID?: string;
  }
}

export class MusicSync {
  nsp: socketIo.Namespace
  token?: string;

  constructor(httpServer: http.Server, socketServer: socketIo.Server) {
    this.nsp = socketServer.of("/musicsync");
    this.start();
  }

  async start() {
    await this.auth();
    this.nsp.on("connection", async (socket: SocketExtended) => {
      
      logger.http(`[Socket.IO] Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.http(`[Socket.IO] Socket disconnected: ${socket.id}`);
      });
      socket.on("requestUpdate", (body: { global: boolean, uuid?: string, sent: number }) => {
        if(body.global) {
          this.httpRequest("GET", "/api/v1/bot/instances", {}, async (success: boolean, body: any) => {
            if(!success) {
              socket.emit("notify", { message: "Music bots are not online", type: "error" });
              return;
            }
            socket.emit("updateResponse", { global: true, data: body });
          });
        } else {
          const reqPath: string = `/api/v1/b/${backendConfig.musicbot.botId}/i/${body.uuid}/event/requestUpdate`;
          const reqBody: any = { password: backendConfig.token, sent: String(body.sent) };
          this.httpRequest("POST", reqPath, reqBody, (success: boolean, body: any) => {
            if(!success) {
              socket.emit("notify", { message: "Instance is not available", type: "error" });
              return;
            }
            body = body[0];
            socket.emit("updateResponse", { global: false, uuid: body.uuid, data: body });
          });
        }
      });

      socket.on("pushUpdate", async (body: any) => {
        if(!await this.authUser(socket, body.type)) {
          return socket.emit("notify", { message: "You do not have permission to do that", type: "error" });
        }
        const reqPath: string = `/api/v1/b/${backendConfig.musicbot.botId}/i/${body.uuid}/event/pushUpdate`;
        delete body.uuid;
        body.password = backendConfig.token;
        this.httpRequest("POST", reqPath, { ...body, socketId: socket.id }, (success: boolean, body: any) => {
          if(!success) {
            return socket.emit("notify", { message: "Could not contact the music bot server", type: "error" });
          }
        });
      });
    });
  }

  async authUser(socket: SocketExtended, permissionString?: UpdateTypes | null) {
    if(permissionString == null) return false;
    const session = socket.handshake.session;
    if(session == null) return;
    const user = session.passport.user;
    return await new Promise((resolve, reject) => {
      authenticator(`musicbot-${permissionString}`)(
        <any> { ...socket.request, user }, <any> {}, <NextFunction> (err: any) => resolve(err == null)
      );
    });
  }

  async auth() {
    await this.httpRequest("POST","/api/v1/bot/login",
      {
        username: backendConfig.musicbot.username,
        password: backendConfig.musicbot.password,
        botId: backendConfig.musicbot.botId
      },
      (success: boolean, body: any) => {
        if(!success) return;
        this.token = body.token;
        this.restartSockets();
      }
    );
  }

  restartSockets() {
    const sockets = this.nsp.sockets;
    sockets.forEach(socket => socket.disconnect());
  }

  async httpRequest(method: string, path: string, body: any, callback?: any) {
    var options = {
      method: method,
      uri: backendConfig.musicbot.url + path,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "bearer " + this.token
      },
      body: JSON.stringify(body)
    }
  
    await reqPromise(options).then(function(res) {
      try {
        const body = JSON.parse(res);
        callback(true, body);
      } catch(err) {
        callback(false);
      }
    }).catch(async (err) => {
      if(err.error === "Invalid username or password.") {
        console.log("Could not authenticate against music bot server.");
        this.nsp.emit("notify", { message: "Could not authenticate internally, please try again later...", type: "error" });
        return;
      } else if(err.statusCode === 401) {
        console.log("Invalid auth token, attempting to re-authenticate.");
        this.auth();
        return;
      }
      callback(false);
    });
  }
}

type UpdateTypes = "skip" | "restart" | "seek" | "vol" | "unmute" | "mute" | "skip-to" | "queue" | "queue-playlist" | "play" | "clear" | "splice"