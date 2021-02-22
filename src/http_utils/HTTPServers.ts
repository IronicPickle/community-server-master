import HTTPMethods, { DeleteResponse, PatchResponse, PostResponse } from "./HTTPMethods";
import { logger } from "../app";
import { Server } from "../models/Server";
import { ServerPost } from "../models/ServerPost";

export type CreateOptions = Server;

export type EditOptions = Server;

export interface DeleteOptions {
  [key: string]: any;
  channelId: string;
}

export type CreatePostOptions = ServerPost & { channelId: string }

export interface EditErrors {
  [key: string]: any;
  channelId?: string;
}

export interface DeleteErrors {
  [key: string]: any;
  channelId?: string;
}

export interface CreateData {
  [key: string]: any;
  channelId?: string | null;
  messageId?: string | null;
}

export interface CreatePostData {
  [key: string]: any;
  messageId?: string | null;
}

export default class HTTPServers {

  public static async create(inputs: CreateOptions) {
    logger.info(`[Discord] Servers: Create`);
    return <PostResponse<CreateData, void>> await HTTPMethods.postRequest("/api/servers/create", { inputs });
  }

  public static async edit(inputs: EditOptions) {
    logger.info(`[Discord] Servers: Edit`);
    return <PatchResponse<void, EditErrors>> await HTTPMethods.patchRequest("/api/servers/edit", { inputs });
  }

  public static async delete(inputs: DeleteOptions) {
    logger.info(`[Discord] Servers: Delete`);
    return <DeleteResponse<DeleteErrors>> await HTTPMethods.deleteRequest(`/api/servers/delete?channelId=${inputs.channelId}`);
  }

  public static async createPost(inputs: CreatePostOptions) {
    logger.info(`[Discord] Server: Create Post`);
    return <PostResponse<CreatePostData, void>> await HTTPMethods.postRequest("/api/servers/createPost", { inputs });
  }

}