import { Server } from "http";
import Members from "../models/Member";
import { serverTypes } from "../models/Server";

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

  public static postTitle(text?: string): string {
    let err = "";
    if(typeof text === "string") {
      if(text.length < 5) {
        err = "News Post titles must be at least 5 characters";
      } else if(text.length > 100) {
        err = "News Post titles must not exceed 100 chracters";
      }
    } else {
      err = "News Post is invalid";
    }

    return err;
  }

  public static postBody(text?: string): string {
    let err = "";
    if(typeof text === "string") {
      if(text.length < 10) {
        err = "News Posts must be at least 10 characters";
      } else if(text.length > 10000) {
        err = "News Posts must not exceed 1000 chracters";
      }
    } else {
      err = "News Post is invalid";
    }

    return err;
  }

  public static serverType(type?: string): string {
    let err = "";
    if(type != null) {
      if(!serverTypes.find(serverType => serverType.type === type)) {
        err = "Server Type not found";
      }
    } else {
      err = "Server Type is invalid";
    }
  
    return err;
  }

  public static serverName(text?: string): string {
    let err = "";
    if(typeof text === "string") {
      if(text.length < 5) {
        err = "Server Name must be at least 5 characters";
      } else if(text.length > 50) {
        err = "Server Name must not exceed 100 chracters";
      }
    } else {
      err = "Server Name is invalid";
    }

    return err;
  }

  public static serverDescription(text?: string): string {
    let err = "";
    if(typeof text === "string") {
      if(text.length < 5) {
        err = "Server Description must be at least 5 characters";
      } else if(text.length > 100) {
        err = "Server Description must not exceed 100 chracters";
      }
    } else {
      err = "Server Description is invalid";
    }

    return err;
  }

  public static serverAddress(text?: string): string {
    let err = "";
    if(typeof text === "string") {
      if(text.length < 5) {
        err = "Server Address must be at least 5 characters";
      } else if(text.length > 200) {
        err = "Server Address must not exceed 200 chracters";
      }
    } else {
      err = "Server Address is invalid";
    }

    return err;
  }

  public static serverPort(text?: string): string {
    console.log(text)
    let err = "";
    if(typeof text === "string") {
      if(text.length > 0) {
        const port = parseInt(text);
        if(!isNaN(port)) {
          if(port < 0) {
            err = "Server Port can not be less than 0";
          } else if(port > 65535) {
            err = "Server Port can not be greater than 65535";
          }
        } else {
          err = "Server Port is Invalid";
        }
      }
    } else {
      err = "Server Port is Invalid";
    }

    return err;
  }

}