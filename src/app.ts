import NodeServer from "./server/NodeServer";
import mongoose from "mongoose";
import Config from "./utils/Config";
import winston, { transports } from "winston";
import BackendConfig, { backendConfig } from "./utils/BackendConfig";
import { exit } from "process";
import figlet from "figlet";

const logLevel = (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.simple(),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./log/error.log", level: "error" }),
    new transports.File({ filename: "./log/combined.log" })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "./log/exceptions.log" })
  ]
});

console.log("\n#===============================#");
console.log(`${figlet.textSync(" Master", { font: "Doom" })}`);
console.log("#===============================#\n");

export let nodeServer: NodeServer;

logger.info("[Node] Initialising");

Config.load().then(() => {
  BackendConfig.load().then(() => {
    if(!backendConfig.url) throw new Error("[Config] No public URL configured");
    if(!backendConfig.companion.token) throw new Error("[Config] No companion token configured");

    const environment = process.env.NODE_ENV;
    logger.info(`[Node] Environment: ${environment}`);

    nodeServer = new NodeServer();
    nodeServer.start().then(() => {
      logger.info(`[Node] Listening on: ${nodeServer.port}`);
    }).catch((err: Error) => {
      logger.error(err);
      exit();
    });

    mongoose.connect(backendConfig.dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      logger.info(`[Mongoose] Connection created to: ${backendConfig.dbUrl}`);
    }).catch((err: Error) => {
      logger.error(err);
      exit();
    });

  }).catch((err: Error) => {
    logger.error(err);
    exit();
  });

}).catch((err: Error) => {
  logger.error(err);
  exit();
});