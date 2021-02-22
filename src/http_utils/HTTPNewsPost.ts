import HTTPMethods, { PostResponse, DeleteResponse, PatchResponse } from "./HTTPMethods";
import { logger } from "../app";
import { NewsPost } from "../models/NewsPost";

export interface NewsPostData {
  [key: string]: any;
  messageId?: string | null;
}

export type CreateOptions = NewsPost;

export type EditOptions = NewsPost;

export interface DeleteOptions {
  [key: string]: any;
  messageId: string;
}

export interface EditErrors {
  [key: string]: any;
  messageId?: string;
}

export interface DeleteErrors {
  [key: string]: any;
  messageId?: string;
}

export interface ServerPostData {
  [key: string]: any;
  messageId?: string | null;
}

export default class HTTPNewsPosts {

  public static async create(inputs: CreateOptions) {
    logger.info(`[Discord] Create: News Post`);
    return <PostResponse<ServerPostData, void>> await HTTPMethods.postRequest("/api/newsPosts/create", { inputs });
  }

  public static async edit(inputs: EditOptions) {
    logger.info(`[Discord] Edit: News Post`);
    return <PatchResponse<void, EditErrors>> await HTTPMethods.patchRequest("/api/newsPosts/edit", { inputs });
  }

  public static async delete(inputs: DeleteOptions) {
    logger.info(`[Discord] Delete: News Post`);
    const queryString = `?messageId=${inputs.messageId}`
    return <DeleteResponse<DeleteErrors>> await HTTPMethods.deleteRequest(`/api/newsPosts/delete${queryString}`);
  }

}