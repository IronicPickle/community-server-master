import HTTPMethods, { PostResponse } from "./HTTPMethods";
import { logger } from "../app";

interface RevisionRequestOptions {
  message: string;
}

export default class HTTPNotify {

  public static async revisionRequest(discordId: string, authorDiscordId: string, inputs: RevisionRequestOptions) {
    logger.info(`[Discord] Notification: revision request sent to guild-member-${discordId} by guild-member-${authorDiscordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/notify/revisionRequest", { discordId, authorDiscordId, inputs });
  }

  public static async applicationStart(discordId: string) {
    logger.info(`[Discord] Notification: application start sent to guild-member-${discordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/notify/applicationStart", { discordId });
  }

  public static async applicationWarning(discordId: string, startDate: Date) {
    logger.info(`[Discord] Notification: application timeout warning sent to guild-member-${discordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/notify/applicationWarning", { discordId, startDate });
  }

  public static async applicationReset(discordId: string, startDate: Date) {
    logger.info(`[Discord] Notification: application reset sent to guild-member-${discordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/notify/applicationReset", { discordId, startDate });
  }

  public static async applicationComplete(discordId: string, authorDiscordId: string) {
    logger.info(`[Discord] Notification: application completion sent to guild-member-${discordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/notify/applicationComplete", { discordId, authorDiscordId });
  }

  public static async applicationRevert(discordId: string, authorDiscordId: string) {
    logger.info(`[Discord] Notification: application reversion sent to guild-member-${discordId}`);
    return <PostResponse<void>> await HTTPMethods.postRequest("/api/notify/applicationRevert", { discordId, authorDiscordId });
  }

}