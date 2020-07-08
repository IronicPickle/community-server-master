import api from "../routes/api";
import auth from "../routes/auth";
import { RequestHandler } from "express";

const routes: { [key: string]: RequestHandler } = {
  "/api": api,
  "/auth": auth
}

export default routes;