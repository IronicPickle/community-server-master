import HTTPMethods, { GetResponse, PostResponse } from "./HTTPMethods";

export interface FactionData {
  [key: string]: any;
  id: number;
  name: string;
  alleigiance: string;
  government: string;
  influence: number;
  state: string;
  isPlayer: boolean;
}

export interface FactionsData {
  id: string;
  name: string;
  controllingFaction: {
    id: number;
    name: string;
    alleigiance: string;
    government: string;
  };
  factions: FactionData[];
  factionId: number;
}

export interface MissionData {
  _id: string,
  description: string;
  objectives: string[];
  authorId: string;
  factionsData: FactionsData;
  creationDate: Date;
}

export interface QueryData {
  missions: MissionData[];
  count: number;
}

export interface BroadcastOptions {
  description: string;
  objectives: string[];
}

export interface BroadcastErrors {
  description: string;
  objectives: string[];
}

export default class HTTPMissions {

  public static async query(snipStart: number) {
    return await HTTPMethods.getRequest(`/api/missions/query?snipStart=${snipStart}`) as GetResponse<QueryData>;
  }

  public static async broadcast(authorDiscordId: string, inputs: BroadcastOptions) {
    return await HTTPMethods.postRequest("/api/missions/broadcast", { authorDiscordId, inputs }) as PostResponse<BroadcastErrors>;
  }

}