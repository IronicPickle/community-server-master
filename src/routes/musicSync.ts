import express from "express";
import http from "http";

interface UpdateRequiredVarsI {
  data: { message: string, type: string, global?: boolean },
  uuid: string,
  password: string
}
interface NotifydVarsI {
  data: { message: string, type: string, socketId: string },
  uuid: string,
  password: string
}

export default (httpInstance: http.Server, ioInstance: SocketIO.Server) => {
  const router = express.Router();
  const nsp = ioInstance.of("/musicsync");
  const password = process.env.MUSIC_SYNC_PASS

  router.post("/updateRequired", (req, res, next) => {
    var body: UpdateRequiredVarsI = req.body;
    if(password !== body.password) {
      res.sendStatus(401); return;
    }
    delete body.password;
    nsp.emit("updateRequired", body);
  });

  router.post("/notify", (req, res, next) => {
    var body: NotifydVarsI = req.body;
    if(password !== body.password) {
      res.sendStatus(401); return;
    }
    delete body.password;
    for(const i in nsp.sockets) {
      const socket = nsp.sockets[i];
      if(socket.id === body.data.socketId) {
        socket.emit("notify", body.data);
        delete body.data.socketId;
      }
    }
  });

  return router;
};