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
    | 'MANAGE_EMOJIS'
    | "ANYONE";

interface ConfigSchema {
  permissions: { [key: string]: PermissionString };
}

const defaultConfig: ConfigSchema = {
  permissions: {
    "view-management-page": "MANAGE_MESSAGES",
    //"view-stats-page": "ADMINISTRATOR", //unused
    "view-profile-page": "SEND_MESSAGES",
    "view-musicsync-page": "SEND_MESSAGES",

    "login": "SEND_MESSAGES",

    //"query-config": "ADMINISTRATOR", // unused
    "query-members": "MANAGE_MESSAGES",
    //"query-members-stats": "ADMINISTRATOR", // unused
    "query-newsposts": "ANYONE",
    "query-servers": "ANYONE",
    "status-servers": "ANYONE",

    "create-member": "MANAGE_MESSAGES",
    "create-newspost": "ADMINISTRATOR",
    "create-server": "ADMINISTRATOR",
    "create-serverpost": "ADMINISTRATOR",

    "edit-newspost": "ADMINISTRATOR",
    "edit-server": "ADMINISTRATOR",

    "delete-newspost": "ADMINISTRATOR",
    "delete-server": "ADMINISTRATOR",

    //"edit-config": "ADMINISTRATOR", // unused
    //"update-member": "ADMINISTRATOR", // unused

    "musicbot-queue": "CONNECT",
    "musicbot-queue-playlist": "MANAGE_MESSAGES",
    "musicbot-play": "MANAGE_MESSAGES",

    "musicbot-skip": "MANAGE_MESSAGES",
    "musicbot-skip-to": "MANAGE_MESSAGES",
    "musicbot-restart": "MANAGE_MESSAGES",
    "musicbot-clear": "MANAGE_MESSAGES",
    "musicbot-splice": "MANAGE_MESSAGES",

    "musicbot-vol": "MANAGE_MESSAGES",
    "musicbot-unmute": "MANAGE_MESSAGES",
    "musicbot-mute": "MANAGE_MESSAGES",

    "musicbot-seek": "MANAGE_MESSAGES"
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
        //"view-stats-page": { type: "string" }, //unused
        "view-profile-page": { type: "string" },

        "login": { type: "string" },

        //"query-config": { type: "string" }, // unused
        "query-members": { type: "string" },
        //"query-members-stats": { type: "string" }, // unused
        "query-newsposts": { type: "string" },
        "query-servers": { type: "string" },
        "status-servers": { type: "string" },

        "create-member": { type: "string" },
        "create-newspost": { type: "string" },
        "create-server": { type: "string" },
        "create-serverpost": { type: "string" },

        "edit-newspost": { type: "string" },
        "edit-server": { type: "string" },

        "delete-newspost": { type: "string" },
        "delete-server": { type: "string" },

        "musicbot-queue": { type: "string" },
        "musicbot-queue-playlist": { type: "string" },
        "musicbot-skip": { type: "string" },
        "musicbot-skip-to": { type: "string" },
        "musicbot-": { type: "string" },
        "musicbot-restart": { type: "string" },
        "musicbot-clear": { type: "string" },
        "musicbot-splice": { type: "string" },
        "musicbot-vol": { type: "string" },
        "musicbot-unmute": { type: "string" },
        "musicbot-mute": { type: "string" },
        "musicbot-seek": { type: "string" },

      }
    }
  }
}

const validator = new Validator();

export default class Config {
  private static path = "./config/config.json";

  public static load() {

    return new Promise<void>((resolve, reject) => {
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