import TransModel from "../models/TransactionModal.js";
import NftModel from "../models/nftModel.js";
import { gql } from "apollo-server-express";
export const transTypeDefs = gql`
  type Trans {
    transactionType: String
    buyerId: User
    sellerId: User
    nftId: Nft
  }

  type Query {
    getNftTrans(nftId: String): [Trans]
  }

  type Mutation {
    createTrans(
      transactionType: String
      buyerId: String
      sellerId: String
      nftId: String
    ): Trans
  }
`;

export const transResolvers = {
  Query: {
    getNftTrans: async (root, args) => {
      const trans = await TransModel.find({ nftId: args.nftId })
        .populate("buyerId")
        .populate("sellerId");
      console.log(trans);
      return trans;
    },
  },

  Mutation: {
    createTrans: async (root, args) => {
      const trans = await TransModel(args);
      await trans.save().then(
        async () =>
          await NftModel.findByIdAndUpdate(
            args.nftId,
            { $push: { transactions: trans } },
            {
              new: true,
              upsert: true,
            }
          )
      );

      return trans;
    },
  },
};
