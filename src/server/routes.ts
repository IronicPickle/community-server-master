import api from "../routes/api";
import auth from "../routes/auth";
import musicSync from "../routes/musicSync";
import { Router } from "express";
import http from "http";
import socketIo from "socket.io";

const routes: { [key: string]: (httpServer: http.Server, socketServer?: socketIo.Server) => Router } = {
  "/api": api,
  "/auth": auth,
  "/musicSync": musicSync
}

export default routes;