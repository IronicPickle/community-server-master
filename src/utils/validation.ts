import Members from "../models/members";

export default class Validation {

  public static async discordId(discordId?: string): Promise<string> {

    let err = "";
    if(typeof discordId === "string") {
      if(discordId.length !== 18 || !(/[\d]{18}/g).test(discordId)) {
        err = "A Discord ID must be an 18 digit string";
      } else if(await Members.findOne({ discordId })) {
        err = "A member with that discord ID already exists";
      }
    } else {
      err = "Discord ID is invalid"
    }
  
    return err;

  }

  public static inaraName(inaraName?: string): string {

    let err = "";
    if(typeof inaraName === "string") {
      if(inaraName.length > 500) {
        err = "Inara Name must not exceed 500 chracters";
      }
    }

    return err;

  }

  public static inGameName(inGameName?: string): string {

    let err = "";
    if(typeof inGameName === "string") {
      if(inGameName.length > 500) {
        err = "In-Game Name must not exceed 500 chracters";
      }
    }
  
    return err;

  }

  public static joinedSquadron(joinedSquadron?: boolean): string {

    let err = "";
    if(typeof joinedSquadron !== "boolean") {
      err = "Joined Squadron is invalid";
    }
  
    return err;

  }

  public static joinedInaraSquadron(joinedInaraSquadron?: boolean): string {

    let err = "";
    if(typeof joinedInaraSquadron !== "boolean") {
      err = "Joined Inara Squadron is invalid";
    }
  
    return err;

  }

  public static message(message?: string): string {

    let err = "";
    if(typeof message === "string") {
      if(message.length < 10) {
        err = "Revision Message must be at least 10 characters";
      } else if(message.length > 500) {
        err = "Revision Message must not exceed 500 chracters";
      }
    } else {
      err = "Revision Message is invalid";
    }

    return err;

  }

  public static description(description?: string): string {

    let err = "";
    if(typeof description === "string") {
      if(description.length < 10) {
        err = "Mission Description must be at least 10 characters";
      } else if(description.length > 1024) {
        err = "Mission Description must not exceed 1024 chracters";
      }
    } else {
      err = "Mission Description is invalid";
    }

    return err;

  }

  public static objectives(objectives?: string[]): string[] {

    let err: string[] = [];
    if(typeof objectives === "object") {
      for(const i in objectives) {
        const objective = objectives[i];
        if(objective.length < 10) {
          err[i] = `Mission Objectives must be at least 10 characters`;
        } else if(objective.length > 500) {
          err[i] = `Mission Objectives must not exceed 500 chracters`;
        }
      }
    } else {
      err[0] = "Mission Objectives are invalid";
    }

    return err;

  }

}