import express from "express";
import http from "http";
import socketIo from "socket.io";
import { backendConfig } from "../utils/BackendConfig";

interface UpdateRequired {
  data: { message: string, type: string, global?: boolean },
  uuid: string,
  password?: string
}
interface Notify {
  data: { message: string, type: string, socketId?: string },
  uuid: string,
  password?: string
}

export default (httpServer: http.Server, socketServer?: socketIo.Server) => {
  if(socketServer == null) throw(new Error("Missing socket.io server"));
  const router = express.Router();
  const nsp = socketServer.of("/musicsync");
  const password = backendConfig.token;

  router.post("/updateRequired", (req, res, next) => {
    var body: UpdateRequired = req.body;
    if(password !== body.password) {
      res.sendStatus(401); return;
    }
    delete body.password;
    nsp.emit("updateRequired", body);
  });

  router.post("/notify", (req, res, next) => {
    var body: Notify = req.body;
    if(password !== body.password) {
      res.sendStatus(401); return;
    }
    delete body.password;
    for(const i in nsp.sockets) {
      const socket = nsp.sockets.get(i);
      if(socket == null) continue;
      if(socket.id === body.data.socketId) {
        socket.emit("notify", body.data);
        delete body.data.socketId;
      }
    }
  });

  return router;
}