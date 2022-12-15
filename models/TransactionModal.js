import mongoose from "mongoose";

const TransactionSchema = mongoose.Schema({
  transactionType: {
    type: String,
    enum: [
      "mint",
      "place_bid",
      "purchase_nft",
      "put_on_sale",
      "put_on_auction",
      "remove_on_sale",
      "remove_on_auction",
      "transfer_to_high",
    ],
    default: "mint",
    require: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nft",
  },
});

export default mongoose.model("Transaction", TransactionSchema);
