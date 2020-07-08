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
  inGameName: string;
  inaraName: string;
  joinedSquadron: boolean;
  joinedInaraSquadron: boolean;
  applicationStatus: {
    stage: number;
    reviewedById?: string;
    completedById?: string;
    revertedById?: string;
    startDate?: Date;
    warningSent: boolean;
  };
  revisionMessages: {
    _id: string;
    text: string;
    authorId: string;
    creationDate: Date;
    author: {
      discordId: string,
      discordName: string,
      discordAvatar?: string
    }
  }[];
  joinDate: Date;
}

export interface CreateOptions {
  discordId: string,
  inaraName?: string,
  inGameName?: string
}

export interface CreateErrors {
  discordId: string,
  inaraName: string,
  inGameName: string
}

export interface CreateRevisionRequestOptions {
  message: string
}

export interface CreateRevisionRequestErrors {
  message: string
}

export interface EditOptions {
  inaraName: string,
  inGameName: string,
  joinedSquadron: boolean,
  joinedInaraSquadron: boolean
}

export interface EditErrors {
  inaraName: string,
  inGameName: string,
  joinedSquadron: string,
  joinedInaraSquadron: string
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

  public static async createRevisionRequest(_id: string, authorDiscordId: string, inputs: CreateRevisionRequestOptions) {
    return await HTTPMethods.postRequest(`/api/members/createRevisionRequest`, { _id, authorDiscordId, inputs }) as PostResponse<CreateRevisionRequestErrors>;
  }

  public static async edit(_id: string, authorDiscordId: string, inputs: EditOptions) {
    return await HTTPMethods.patchRequest(`/api/members/edit`, { _id, authorDiscordId, inputs }) as PatchResponse<EditErrors>;
  }

  public static async completeApplication(_id: string, authorDiscordId: string) {
    return await HTTPMethods.patchRequest(`/api/members/completeApplication`, { _id, authorDiscordId }) as PatchResponse<void>;
  }

  public static async revertApplication(_id: string, authorDiscordId: string) {
    return await HTTPMethods.patchRequest(`/api/members/revertApplication`, { _id, authorDiscordId }) as PatchResponse<void>;
  }

}