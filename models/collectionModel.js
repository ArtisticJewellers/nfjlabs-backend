import mongoose from "mongoose"

const collectionSchema = mongoose.Schema({
  collectionName: {
    type: String,
    required: true
  },
  collectionAddress: {
    type: String,
    required: true
  },
  bannerImageUrl: {
    type: String,
  },
  avatarUrl: {
    type: String,
    required: true
  },
  chain: {
    type: String,
    required: true
  },
  nfts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nft"
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
})

export default mongoose.model("Collections", collectionSchema)
