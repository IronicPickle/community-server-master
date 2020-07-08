import HTTPMethods, { GetResponse } from "./HTTPMethods";

export interface QueryData {
  factionsData: FactionsData;
}

export interface FactionData {
  [key: string]: any;
  id: number;
  name: string;
  alleigiance: string;
  government: string;
  isPlayer: boolean;
}

export interface FactionsData {
  id: number;
  name: string;
  controllingFaction: FactionData;
  factions: FactionData[];
  factionId: number;
}

export default class HTTPBGS {

  public static async query() {
    return <GetResponse<QueryData>> await HTTPMethods.getRequest("/api/bgs/query");
  }

}