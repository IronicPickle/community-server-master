import { DBMemberDataExtended } from "../http_utils/HTTPAuth";

export function authenticate(permissionString: string, memberData?: DBMemberDataExtended | null) {
  if(memberData == null) return false;
  return memberData.webPerms[permissionString];
}