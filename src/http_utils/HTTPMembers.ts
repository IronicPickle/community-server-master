import HTTPMethods, { GetResponse } from "./HTTPMethods";
import { PermissionString } from "../utils/Config";

interface DiscordRole {
  guild: string;
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  rawPosition: number;
  permissions: number;
  managed: boolean;
  mentionable: boolean;
  deleted: boolean;
  createdTimestamp: number;
}

interface DiscordMember {
  guildID: string;
  userID: string;
  joinedTimestamp: number;
  lastMessageChannelID: string;
  premiumSinceTimeStamp: number | null;
  delete: boolean;
  nickname: string | null;
  displayName: string;
  perms: PermissionString[];
  roles: DiscordRole[];
  avatar: string;
}

interface QueryData {
  members: DiscordMember[];
}

export default class HTTPMembers {

  public static async query(discordId: string) {
    return <GetResponse<QueryData>> await HTTPMethods.getRequest(`/api/members/query?discordId=${discordId}`);
  }

  public static async queryStats() {
    return <GetResponse<any>> await HTTPMethods.getRequest("/api/members/queryStats");
  }

}