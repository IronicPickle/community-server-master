import mongoose from "mongoose";

export interface NewsPost extends mongoose.Document {
  [key: string]: any;
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorDiscordId: string;
  messageId?: string;
  title: string;
  body: string;
  datePosted: string;
}

const newsPostSchema = new mongoose.Schema({
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
}, {collection: "newsPosts"});

export default mongoose.model<NewsPost>("NewsPost", newsPostSchema);
