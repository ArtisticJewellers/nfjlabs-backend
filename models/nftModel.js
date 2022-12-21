import mongoose from "mongoose";

const nftSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tokenId: {
      type: Number,
      required: true,
    },
    ipfsUrl: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    chainId: {
      type: Number,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    creatorAddress: {
      type: String,
      required: true,
    },
    contractAddress: {
      type: String,
      required: true,
    },
    ownerAddress: {
      type: String,
      required: true,
    },
    isMarketPlace: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      require: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
      default: 0,
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Nft", nftSchema);
