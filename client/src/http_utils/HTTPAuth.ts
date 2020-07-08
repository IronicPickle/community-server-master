import HTTPMethods, { GetResponse } from "./HTTPMethods";
import { DBMemberData } from "./HTTPMembers";

export type DBMemberDataExtended = {
  webPerms: { [key: string]: boolean };
} & DBMemberData;

export interface QueryData {
  [key: string]: any;
  csrfToken: string;
  member: DBMemberDataExtended;
}

export default class HTTPAuth {

  public static async check() {
    return await HTTPMethods.getRequest("/auth/check") as GetResponse<QueryData>;
  }

}