import mongoose from "mongoose";
import { FactionsData } from "../http_utils/HTTPBGS";

export interface MissionsI extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  description: string,
  objectives: string[],
  authorId: string,
  factionsData: FactionsData
  creationDate: Date;
}

const missionsSchema = new mongoose.Schema({
  description: {
    type: String,
    require: true
  },
  objectives: {
    type: Array,
    require: true
  },
  authorId: {
    type: String,
    require: true
  },
  factionsData: {
    type: Object,
    require: true
  },
  creationDate: {
    type: Date,
    require: true,
    default: Date.now
  }
}, {collection: "missions"});

export default mongoose.model<MissionsI>("Missions", missionsSchema);
