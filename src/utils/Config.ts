import fs from "fs";
import path from "path";
import { logger } from "../app";
import { Validator, Schema } from "jsonschema";

export type PermissionString =
    | 'CREATE_INSTANT_INVITE'
    | 'KICK_MEMBERS'
    | 'BAN_MEMBERS'
    | 'ADMINISTRATOR'
    | 'MANAGE_CHANNELS'
    | 'MANAGE_GUILD'
    | 'ADD_REACTIONS'
    | 'VIEW_AUDIT_LOG'
    | 'PRIORITY_SPEAKER'
    | 'STREAM'
    | 'VIEW_CHANNEL'
    | 'SEND_MESSAGES'
    | 'SEND_TTS_MESSAGES'
    | 'MANAGE_MESSAGES'
    | 'EMBED_LINKS'
    | 'ATTACH_FILES'
    | 'READ_MESSAGE_HISTORY'
    | 'MENTION_EVERYONE'
    | 'USE_EXTERNAL_EMOJIS'
    | 'VIEW_GUILD_INSIGHTS'
    | 'CONNECT'
    | 'SPEAK'
    | 'MUTE_MEMBERS'
    | 'DEAFEN_MEMBERS'
    | 'MOVE_MEMBERS'
    | 'USE_VAD'
    | 'CHANGE_NICKNAME'
    | 'MANAGE_NICKNAMES'
    | 'MANAGE_ROLES'
    | 'MANAGE_WEBHOOKS'
    | 'MANAGE_EMOJIS';

interface ConfigSchema {
  permissions: { [key: string]: PermissionString };
}

const defaultConfig: ConfigSchema = {
  permissions: {
    "view-management-page": "MANAGE_MESSAGES",
    "view-bgs-page": "SEND_MESSAGES",
    //"view-stats-page": "ADMINISTRATOR", //unused
    "view-profile-page": "SEND_MESSAGES",

    "login": "SEND_MESSAGES",

    //"query-config": "ADMINISTRATOR", // unused
    "query-members": "MANAGE_MESSAGES",
    //"query-members-stats": "ADMINISTRATOR", // unused
    "query-missions": "SEND_MESSAGES",

    "create-member": "MANAGE_MESSAGES",
    "create-revision-request": "MANAGE_MESSAGES",
    "broadcast-mission": "MANAGE_MESSAGES",

    //"edit-config": "ADMINISTRATOR", // unused
    "edit-member": "MANAGE_MESSAGES",
    //"update-member": "ADMINISTRATOR", // unused
    //"start-application": "ADMINISTRATOR", // unused
    //"reset-application": "ADMINISTRATOR", // unused
    "complete-application": "MANAGE_MESSAGES",
    "revert-application": "MANAGE_MESSAGES"
  }
}

export let config: ConfigSchema = JSON.parse(JSON.stringify(defaultConfig));

const configSchema: Schema = {
  type: "object",
  properties: {
    permissions: {
      type: "object",
      properties: {
        "view-management-page": { type: "string" },
        "view-bgs-page": { type: "string" },
        //"view-stats-page": { type: "string" }, //unused
        "view-profile-page": { type: "string" },

        "login": { type: "string" },

        //"query-config": { type: "string" }, // unused
        "query-members": { type: "string" },
        //"query-members-stats": { type: "string" }, // unused
        "query-missions": { type: "string" },

        "create-member": { type: "string" },
        "create-revision-request": { type: "string" },
        "broadcast-mission": { type: "string" },

        //"edit-config": { type: "string" }, // unused
        "edit-member": { type: "string" },
        //"update-member": { type: "string" }, // unused
        //"start-application": { type: "string" }, // unused
        //"reset-application": { type: "string" }, // unused
        "complete-application": { type: "string" },
        "revert-application": { type: "string" }
      }
    }
  }
}

const validator = new Validator();

export default class Config {
  private static path = "./config/config.json";

  public static load() {

    return new Promise((resolve, reject) => {
      fs.readFile(this.path, { encoding: "utf-8" }, (err: NodeJS.ErrnoException | null, data: string) => {
        if(err) {
          this.generate();
          return resolve();
        }

        try {
          const parsedData = JSON.parse(data);
          const validation = validator.validate(parsedData, configSchema);
          if(!validation.valid) return reject(`[Config] config.json does not match schema:\n  ${validation.errors.join("\n  ")}`);
          
          config = parsedData;
          logger.info("[Config] Loaded config.json file");
          resolve();
        } catch(err) {
          reject(`[Config] ${err}`);
        }
      });
    });

  }

  private static generate() {

    if(!fs.existsSync(path.dirname(this.path))) fs.mkdirSync(path.dirname(this.path));

    fs.writeFileSync(this.path, JSON.stringify(defaultConfig, null, 2));
    logger.info("[Config] Generated default config.json file");

  }

  public static save() {

    fs.writeFileSync(this.path, JSON.stringify(config, null, 2));
    logger.info("[Config] Saved config.json file");

  }

  public static reset() {

    fs.writeFileSync(this.path, JSON.stringify(defaultConfig, null, 2));
    config = JSON.parse(JSON.stringify(defaultConfig));
    logger.info("[Config] Reset config.json file");

  }

}