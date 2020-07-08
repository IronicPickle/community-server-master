import { FactionsData } from "./HTTPBGS";
import HTTPMethods, { PostResponse } from "./HTTPMethods";
import { logger } from "../app";

interface BroadcastOptions {
  description: string;
  objectives: string[];
}

export default class HTTPMissions {

  public static async broadcast(authorDiscordId: string, factionsData: FactionsData, inputs: BroadcastOptions) {
    logger.info(`[Discord] Broadcast: BGS mission sent by guild-member-${authorDiscordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/missions/broadcast", { authorDiscordId, factionsData, inputs });
  }
  
}