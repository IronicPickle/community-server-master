import mongoose from "mongoose";

export interface Member extends mongoose.Document {
  [key: string]: any;
  _id: mongoose.Types.ObjectId;
  discordId: string;
  discordName: string;
  discordPerms: string[];
  discordRoles: any[];
  discordAvatar?: string;
  joinData: Date;
}

const memberSchema = new mongoose.Schema({
  discordId: {
    type: String,
    require: true
  },
  discordName: {
    type: String,
    require: true
  },
  discordPerms: {
    type: Array,
    require: true
  },
  discordRoles: {
    type: Array,
    require: true
  },
  discordAvatar: {
    type: String,
    require: false
  },
  joinDate: {
    type: Date,
    require: true,
    default: Date.now
  }
}, {collection: "members"});

export default mongoose.model<Member>("Member", memberSchema);
