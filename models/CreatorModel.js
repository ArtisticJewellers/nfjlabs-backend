import mongoose from "mongoose";

const creatorSchema = mongoose.Schema({
  popularCollection: {
    type: String,
    require: true,
    unique: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  featuredNft: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nft",
    },
  ],
  trendingNft: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nft",
    },
  ],
  bannerNft: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nft",
  },
});

export default mongoose.model("Artist", creatorSchema);
