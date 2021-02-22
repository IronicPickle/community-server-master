import mongoose from "mongoose";

export const serverTypes: { type: ServerType, name: string }[] = [
  { type: "minecraft", name: "Minecraft" },
  { type: "arma3", name: "Arma III" },
]

export type ServerType = "minecraft" | "arma3";

export interface Server extends mongoose.Document {
  [key: string]: any;
  _id: mongoose.Types.ObjectId;
  type: ServerType;
  name: string;
  description: string;
  address: string;
  port: string;
  channelId?: string;
  messageId?: string;
  dateCreated: string;
}

const serverSchema = new mongoose.Schema({
  type: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  port: {
    type: String,
    require: true
  },
  channelId: {
    type: String,
    require: false
  },
  messageId: {
    type: String,
    require: false
  },
  dateCreated: {
    type: Date,
    require: true,
    default: () => new Date()
  }
}, {collection: "servers"});

export default mongoose.model<Server>("Server", serverSchema);
