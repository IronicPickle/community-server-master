import http from "http";
import socketIO from "socket.io";
import reqPromise from "request-promise";

export class MusicSync {
  nsp: socketIO.Namespace
  token?: string;

  constructor(httpInstance: http.Server, ioInstance: socketIO.Server) {
    this.nsp = ioInstance.of("/musicsync");
    this.start();
  }

  async start() {
    await this.auth();
    this.nsp.on("connection", (socket) => {
      socket.on("disconnect", () => {});
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
          const reqPath: string = `/api/v1/b/${process.env.MUSIC_SYNC_BOT_BOTID}/i/${body.uuid}/event/requestUpdate`;
          const reqBody: any = { password: process.env.MUSIC_SYNC_PASS, sent: String(body.sent) };
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

      socket.on("pushUpdate", (body: any) => {
        if(!this.authUser(body.type, body.token)) {
          socket.emit("notify", { message: "You do not have permission to do that", type: "error" });
          return;
        }
        const reqPath: string = `/api/v1/b/${process.env.MUSIC_SYNC_BOT_BOTID}/i/${body.uuid}/event/pushUpdate`;
        delete body.uuid;
        this.httpRequest("POST", reqPath, { ...body, socketId: socket.id }, (success: boolean, body: any) => {
          if(!success) {
            socket.emit("notify", { message: "Could not contact the music bot server", type: "error" });
            return;
          }
        });
      });
    });
  }

  authUser(type: string, token: string) {
    const protectedRoutes = [ "play", "skip", "restart", "clear", "splice", "vol", "mute", "unmute", "seek" ]
    if(!protectedRoutes.includes(type)) return true;
    return (token == process.env.ADMIN_PASS);
  }

  async auth() {
    await this.httpRequest("POST","/api/v1/bot/login",
      {
        username: process.env.MUSIC_SYNC_BOT_USERNAME,
        password: process.env.MUSIC_SYNC_BOT_PASSWORD,
        botId: process.env.MUSIC_SYNC_BOT_BOTID
      },
      (success: boolean, body: any) => {
        if(!success) return;
        this.token = body.token;
      }
    );
  }

  async httpRequest(method: string, path: string, body: any, callback?: any) {
    var options = {
      method: method,
      uri: process.env.MUSIC_SYNC_BOT_ADDRESS + path,
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