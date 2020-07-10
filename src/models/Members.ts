import mongoose from "mongoose";

export interface MembersI extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  discordId: string;
  discordName: string;
  discordPerms: string[];
  discordRoles: any[];
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
    _id: mongoose.Types.ObjectId;
    text: string;
    authorId: mongoose.Types.ObjectId;
    creationDate: Date;
  }[];
  joinData: Date;
}

const membersSchema = new mongoose.Schema({
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
  inGameName: {
    type: String,
    require: true,
    default: ""
  },
  inaraName: {
    type: String,
    require: true,
    default: ""
  },
  joinedSquadron: {
    type: Boolean,
    require: true,
    default: false
  },
  joinedInaraSquadron: {
    type: Boolean,
    require: true,
    default: false
  },
  applicationStatus: {
    stage: {
      type: Number,
      require: true,
      default: 0
    }, reviewedById: {
      type: String,
      require: false
    }, completedById: {
      type: String,
      require: false
    }, revertedById: {
      type: String,
      require: false
    }, startDate: {
      type: Date,
      require: false
    }, warningSent: {
      type: Boolean,
      require: true,
      default: false
    }
  },
  revisionMessages: {
    type: Array,
    require: true,
    default: []
  },
  joinDate: {
    type: Date,
    require: true,
    default: Date.now
  }
}, {collection: "members"});

export default mongoose.model<MembersI>("Members", membersSchema);
