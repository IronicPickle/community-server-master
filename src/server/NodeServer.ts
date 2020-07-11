import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import expressSession, { SessionOptions } from "express-session";
import path from "path";
import { Express } from "express-serve-static-core";
import routes from "./routes";
import http from "http";
import DiscordStrategy from "../auth/DiscordStrategy";
import passport from "passport";
import connectMongoDbSession from "connect-mongodb-session";
import csurf from "csurf";
import fs from "fs";
import { logger } from "../app";
import { backendConfig } from "../utils/BackendConfig";

export default class NodeServer {
  public port: number;

  private express: Express;
  private server: http.Server;
  private publicPath: string;

  constructor() {
    const environment = process.env.NODE_ENV;

    this.port = backendConfig.port;

    this.express = express();
    this.server = http.createServer(this.express);
    
    this.publicPath = path.join(__dirname, (environment === "production") ? "../../client/build" : "../../client/public" );
    this.express.use(express.static(this.publicPath, { index: false }));

    this.express.use(cookieParser());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(bodyParser.json());

    if(!backendConfig.sessionSecret) throw new Error("[Config] No session secret configured");

    const MongoDBStore = connectMongoDbSession(expressSession);
    const Store = new MongoDBStore({ uri: backendConfig.dbUrl, collection: "sessions" });
    const session: SessionOptions = {
      secret: backendConfig.sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: { secure: environment === "production", maxAge: 1000 * 60 * 60 * 24 * 7 * 4 /* 4 weeks */ },
      store: Store
    }
    if(backendConfig.proxy) this.express.set("trust proxy", 1);
    this.express.use(expressSession(session));
    this.express.use(passport.initialize());
    this.express.use(passport.session());
  }

  start() {
    return new Promise(async (resolve, reject) => {

      const environment = process.env.NODE_ENV;

      const express = this.express;
      const port = this.port;
      
      this.server = this.server.listen(port);

      express.all("*", (req: Request, res: Response, next: NextFunction) => {
        logger.http(`[${req.method}] ${req.url} from ${req.ip}`);
        return next();
      });

      for(const i in routes) {
        express.use(i, routes[i]);
        logger.info(`[Node] Registered route '${i}'`);
      }

      if(environment === "production") express.use(csurf());

      express.all("*", (req: Request, res: Response, next: NextFunction) => {
        let file = fs.readFileSync(path.join(this.publicPath, "index.html")).toString();
        if(environment === "production") {
          file = file.replace("__CSRF_TOKEN__", req.csrfToken());
          res.status(200).send(file);
        } else if(backendConfig.devUrl) {
          res.redirect(backendConfig.devUrl);
        } else {
          res.sendStatus(404);
        }
        return next();

      });

      express.use((err: any, req: Request, res: Response, next: NextFunction) => {
        if(err.code === "EBADCSRFTOKEN") {
          logger.http(`[EBADCSRFTOKEN] ${req.url} from ${req.ip}`);
          res.status(403).send({ success: false, msg: "Invalid CSRF token" });
        } else if(err.code === "UNAUTHORISED") {
          logger.http(`[UNAUTHORISED] ${req.url} from ${req.ip}`);
          res.status(401).send({ success: false, msg: "Unauthorised" });
        }

        return next();

      });

      const discordStrategy = new DiscordStrategy();
      discordStrategy.register().then(() => {
        passport.serializeUser(function(user, done) {
          done(null, user);
        });
        
        passport.deserializeUser(function(user, done) {
          done(null, user);
        });
        logger.info("[Passport] Discord OAuth initialised");

        resolve();
        
      }).catch((err: Error) => {
        reject(err);
      });
      
    });
  }
}
