import HTTPMethods, { GetResponse, PostResponse, PatchResponse } from "./HTTPMethods";

export interface QueryOptions {
  [key: string]: any;
  searchKey?: string;
  searchQuery?: string;
  sortKey?: string;
  sortDirection?: 1 | 0 | -1;
  snipStart?: number;
  snipLimit?: number;
  stage?: 0 | 1 | 2 | 3;
}

export interface DiscordRole {
  color: number;
  createdTimestamp: number;
  deleted: boolean;
  guild: string;
  hoist: boolean;
  id: string;
  managed: boolean;
  mentionable: boolean;
  name: string;
  permissions: number;
  rawPosition: number;
}

export interface DBMemberData {
  [key: string]: any;
  _id: string;
  discordId: string;
  discordName: string;
  discordPerms: string[];
  discordRoles: DiscordRole[];
  discordAvatar?: string;
  joinDate: Date | string;
}

export interface CreateOptions {
  discordId: string;
}

export interface CreateErrors {
  discordId: string;
}

export interface QueryData {
  [key: string]: any;
  count: number;
  members: DBMemberData[];
}

export default class HTTPMembers {

  public static async query(queryOptions: QueryOptions) {
    let queryString = "";
    for(const i in queryOptions) {
      queryString += `&${i}=${queryOptions[i]}`;
    }
    queryString = queryString.replace("&", "?");

    return await HTTPMethods.getRequest(`/api/members/query${queryString}`) as GetResponse<QueryData>;
  }

  public static async create(inputs: CreateOptions) {
    return await HTTPMethods.postRequest(`/api/members/create`, { inputs }) as PostResponse<CreateErrors>;
  }

}