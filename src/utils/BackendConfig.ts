import fs from "fs";
import path from "path";
import { logger } from "../app";
import { Validator, Schema } from "jsonschema";

interface BackendConfigSchema {
  url: string | null,
  devUrl: string | null,
  port: number,
  proxy: boolean,
  companion: {
    url: string,
    token: string | null
  },
  discord: {
    clientId: string | null,
    clientSecret: string | null
  },
  dbUrl: string,
  sessionSecret: string | null
}

const defaultBackendConfig: BackendConfigSchema = {
  url: null,
  devUrl: null,
  port: 8080,
  proxy: false,
  companion: {
    url: "http://localhost:8081",
    token: null
  },
  discord: {
    clientId: null,
    clientSecret: null
  },
  dbUrl: "mongodb://localhost/eliteCDB",
  sessionSecret: null
}

export let backendConfig: BackendConfigSchema = JSON.parse(JSON.stringify(defaultBackendConfig));

const backendConfigSchema: Schema = {
  type: "object",
  properties: {
    url: { type: [ "string", "null" ] },
    devUrl: { type: [ "string", "null" ] },
    port: { type: "number" },
    proxy: { type: "boolean" },
    master: {
      type: "object",
      properties: {
        url: { type: "string" },
        token: { type: [ "string", "null" ] }
      }
    },
    discord: {
      type: "object",
      properties: {
        clientId: { type: [ "string", "null" ] },
        clientSecret: { type: [ "string", "null" ] }
      }
    },
    dbUrl: { type: "stirng" },
    sessionSecret: {  type: [ "string", "null" ] }
  }
}

const validator = new Validator();

export default class BackendConfig {
  private static path = "./config/backend.json";

  public static load() {

    return new Promise((resolve, reject) => {
      fs.readFile(this.path, { encoding: "utf-8" }, (err: NodeJS.ErrnoException | null, data: string) => {
        if(err) {
          this.generate();
          return resolve();
        }

        try {
          const parsedData = JSON.parse(data);
          const validation = validator.validate(parsedData, backendConfigSchema);
          if(!validation.valid) return reject(`[Backend Config] backend.json does not match schema:\n  ${validation.errors.join("\n  ")}`);
          
          backendConfig = parsedData;
          logger.info("[Backend Config] Loaded backend.json file");
          resolve();
        } catch(err) {
          reject(`[Backend Config] ${err}`);
        }
        
      });
    });

  }

  private static generate() {

    if(!fs.existsSync(path.dirname(this.path))) fs.mkdirSync(path.dirname(this.path));

    fs.writeFileSync(this.path, JSON.stringify(defaultBackendConfig, null, 2));
    logger.info("[Backend Config] Generated default backend.json file");

  }

}