import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
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

  private server: Express;
  public httpInstance: http.Server | null;
  private publicPath: string;

  constructor() {
    const environment = process.env.NODE_ENV;

    this.port = backendConfig.port;

    this.server = express();
    this.httpInstance = null
    
    this.publicPath = path.join(__dirname, (environment === "production") ? "../../client/build" : "../../client/public" );
    this.server.use(express.static(this.publicPath, { index: false }));

    this.server.use(cookieParser());
    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());

    if(!backendConfig.sessionSecret) throw new Error("[Config] No session secret configured");

    const MongoDBStore = connectMongoDbSession(expressSession);
    const Store = new MongoDBStore({ uri: backendConfig.dbUrl, collection: "sessions" });
    const session = {
      secret: backendConfig.sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 * 4 /* 4 weeks */ },
      store: Store
    }
    if(environment === "production") session.cookie.secure = true;
    this.server.use(expressSession(session));
    this.server.use(passport.initialize());
    this.server.use(passport.session());
  }

  start() {
    return new Promise(async (resolve, reject) => {

      const environment = process.env.NODE_ENV;

      const server = this.server;
      const port = this.port;

      this.httpInstance = server.listen(port);
      if(!this.httpInstance) return reject("[HTTP] No HTTP instance found");

      server.all("*", (req: Request, res: Response, next: NextFunction) => {
        logger.http(`[${req.method}] ${req.url} from ${req.ip}`);
        return next();
      });

      for(const i in routes) {
        server.use(i, routes[i]);
      }

      if(environment === "production") this.server.use(csurf());

      server.all("*", (req: Request, res: Response, next: NextFunction) => {
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

      server.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
