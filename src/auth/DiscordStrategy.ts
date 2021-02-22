import passport from "passport";
import { Strategy, Profile } from "passport-discord";
import refresh from "passport-oauth2-refresh";
import Members from "../models/Member";
import { backendConfig } from "../utils/BackendConfig";
import { config } from "../utils/Config";

export default class DiscordStrategy {

  private clientId: string | null;
  private clientSecret: string | null;

  private strategy?: Strategy;
  
  constructor() {

    this.clientId = backendConfig.discord.clientId;
    this.clientSecret = backendConfig.discord.clientSecret;

  }

  register() {
    return new Promise<void>((resolve, reject) => {

      if(!this.clientId) throw new Error("[Config] No discord client ID configured");
      if(!this.clientSecret) throw new Error("[Config] No discord client secret configured");

      this.strategy = new Strategy({
        clientID: this.clientId,
        clientSecret: this.clientSecret,
        callbackURL: `${backendConfig.url}/auth/discord/callback`,
        scope: [ "identify" ]
      }, async (accessToken: string, refreshToken: string, profile: Profile, callback: (err: any, member: any) => any): Promise<void> => {
        let member = await Members.findOne({ discordId: profile.id });
        if(!member) return callback(null, null);
        if(!member.discordPerms.includes(config.permissions.login)) return callback(null, null);
        callback(null, member);
      });

      passport.use(this.strategy);
      refresh.use(this.strategy);

      resolve();

    });
  }

}