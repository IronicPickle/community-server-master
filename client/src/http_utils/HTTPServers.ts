import { DBMemberData } from "./HTTPMembers";
import HTTPMethods, { GetResponse, PostResponse, PatchResponse, DeleteResponse } from "./HTTPMethods";

export const serverTypes: { type: ServerType, name: string }[] = [
  { type: "minecraft", name: "Minecraft" },
  { type: "arma3", name: "Arma III" },
  { type: "valheim", name: "Valheim" },
]

export type ServerType = "minecraft" | "arma3" | "valheim";

export interface DBServer {
  [key: string]: any;
  _id: string;
  type: ServerType;
  name: string;
  description: string;
  address: string;
  port: string;
  dateCreated: string;
}

export interface DBServerPost {
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
  type: ServerType;
  name: string;
  description: string;
  address: string;
  port: string;
}

export interface EditOptions {
  [key: string]: any;
  _id: string;
  type: ServerType;
  name: string;
  description: string;
  address: string;
  port: string;
}

export interface DeleteOptions {
  [key: string]: any;
  _id: string;
}

export interface CreatePostOptions {
  [key: string]: any;
  title: string;
  body: string;
}

export interface CreateErrors {
  [key: string]: any;
  type?: string;
  name?: string;
  address?: string;
  port?: string;
}

export interface EditErrors {
  [key: string]: any;
  _id?: string;
  type?: string;
  name?: string;
  address?: string;
  port?: string;
}

export interface DeleteErrors {
  [key: string]: any;
  _id?: string;
}

export interface CreatePostErrors {
  [key: string]: any;
  title?: string;
  body?: string;
}

export interface QueryData {
  [key: string]: any;
  count: number;
  members: DBServer[];
}

export interface Player {
  name?: string;
  ping?: number;
  score?: number;
  team?: string;
  address?: string;
}

export interface QueryStatusData {
  [key: string]: any;
  name: string;
  map: string;
  password: boolean;
  maxplayers: number;
  players: Player[];
  bots: Player[];
  connect: string;
  ping: number;
  raw?: object;
}

export default class HTTPServers {

  public static async query() {
    return await HTTPMethods.getRequest(`/api/servers/query`) as GetResponse<QueryData>;
  }

  public static async create(inputs: CreateOptions) {
    return await HTTPMethods.postRequest(`/api/servers/create`, { inputs }) as PostResponse<CreateErrors>;
  }

  public static async edit(inputs: EditOptions) {
    return await HTTPMethods.patchRequest(`/api/servers/edit`, { inputs }) as PatchResponse<EditErrors>;
  }

  public static async delete(serverId: string) {
    const queryString = `?_id=${serverId}`;
    return await HTTPMethods.deleteRequest(`/api/servers/delete${queryString}`) as DeleteResponse<DeleteErrors>;
  }

  public static async createPost(inputs: CreatePostOptions) {
    return await HTTPMethods.postRequest(`/api/servers/createPost`, { inputs }) as PostResponse<CreatePostErrors>;
  }

  public static async queryStatus(serverId: string) {
    const queryString = `?serverId=${serverId}`;
    return await HTTPMethods.getRequest(`/api/servers/status${queryString}`) as GetResponse<QueryStatusData>;
  }

}