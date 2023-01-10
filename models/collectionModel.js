import mongoose from "mongoose";

const collectionSchema = mongoose.Schema({
  collectionName: {
    type: String,
    required: true,
  },
  collectionDesc: String,
  bannerImageUrl: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
  chain: {
    type: String,
  },
  nfts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nft",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Collections", collectionSchema);
