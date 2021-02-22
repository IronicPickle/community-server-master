import HTTPMethods, { GetResponse, PostResponse } from "./HTTPMethods";

export interface QueryOptions {
  [key: string]: any;
  searchKey?: string;
  searchQuery?: string;
  sortKey?: string;
  sortDirection?: 1 | 0 | -1;
  snipStart?: number;
  snipLimit?: number;
}

export interface DiscordRole {
  [key: string]: any;
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
  [key: string]: any;
  discordId: string;
}

export interface CreateErrors {
  [key: string]: any;
  discordId?: string;
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