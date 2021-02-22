import mongoose from "mongoose";

export interface ServerPost extends mongoose.Document {
  [key: string]: any;
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorDiscordId: string;
  serverId: string;
  messageId?: string;
  title: string;
  body: string;
  datePosted: string;
}

const serverPostSchema = new mongoose.Schema({
  authorId: {
    type: String,
    require: true
  },
  authorDiscordId: {
    type: String,
    require: true
  },
  messageId: {
    type: String,
    require: false
  },
  serverId: {
    type: String,
    require: true
  },
  title: {
    type: String,
    require: true
  },
  body: {
    type: String,
    require: true
  },
  datePosted: {
    type: Date,
    require: true,
    default: () => new Date()
  }
}, {collection: "serverPosts"});

export default mongoose.model<ServerPost>("ServerPost", serverPostSchema);
