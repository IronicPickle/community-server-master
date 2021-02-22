import { DBMemberData } from "./HTTPMembers";
import HTTPMethods, { GetResponse, PostResponse, PatchResponse, DeleteResponse } from "./HTTPMethods";

export interface QueryOptions {
  [key: string]: any;
  searchKey?: string;
  searchQuery?: string;
  sortKey?: string;
  sortDirection?: 1 | 0 | -1;
  snipStart?: number;
  snipLimit?: number;
}

export interface DBNewsPost {
  [key: string]: any;
  _id: string;
  authorDiscordId: string;
  author?: DBMemberData;
  title: string;
  body: string;
  datePosted: string;
}

export interface CreateOptions {
  [key: string]: any;
  title: string;
  body: string;
}

export interface EditOptions {
  [key: string]: any;
  _id: string;
  title: string;
  body: string;
}

export interface DeleteOptions {
  [key: string]: any;
  _id: string;
}

export interface CreateErrors {
  [key: string]: any;
  title?: string;
  body?: string;
}

export interface EditErrors {
  [key: string]: any;
  _id?: string;
  title?: string;
  body?: string;
}

export interface DeleteErrors {
  [key: string]: any;
  _id?: string;
}

export interface QueryData {
  [key: string]: any;
  count: number;
  members: DBNewsPost[];
}

export default class HTTPNewsPosts {

  public static async query(queryOptions: QueryOptions) {
    let queryString = "";
    for(const i in queryOptions) {
      queryString += `&${i}=${queryOptions[i]}`;
    }
    queryString = queryString.replace("&", "?");

    return await HTTPMethods.getRequest(`/api/newsPosts/query${queryString}`) as GetResponse<QueryData>;
  }

  public static async create(inputs: CreateOptions) {
    return await HTTPMethods.postRequest(`/api/newsPosts/create`, { inputs }) as PostResponse<CreateErrors>;
  }

  public static async edit(inputs: EditOptions) {
    return await HTTPMethods.patchRequest(`/api/newsPosts/edit`, { inputs }) as PatchResponse<EditErrors>;
  }

  public static async delete(postId: string) {
    const queryString = `?_id=${postId}`
    return await HTTPMethods.deleteRequest(`/api/newsPosts/delete${queryString}`) as DeleteResponse<DeleteErrors>;
  }

}