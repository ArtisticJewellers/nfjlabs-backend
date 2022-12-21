import NftModel from "../models/nftModel.js";
import { gql } from "apollo-server-express";
import walletModel from "../models/walletModel.js";
import UserModel from "../models/userModel.js";

export const nftTypeDefs = gql`
  type Nft {
    _id: ID
    name: String
    tokenId: Int
    ipfsUrl: String
    imageUrl: String
    category: String
    chainId: Int
    network: String
    ownerAddress: String
    creatorAddress: String
    contractAddress: String
    isMarketPlace: Boolean
    isApproved: Boolean
    isListed: Boolean
    price: Float
    ownerUserId: [User]
    tags: [String]
    unlockableContent: String
  }
  type AllNft {
    _id: ID
    name: String
    tokenId: Int
    ipfsUrl: String
    imageUrl: String
    category: String
    chainId: Int
    network: String
    ownerAddress: String
    creatorAddress: String
    contractAddress: String
    isMarketPlace: Boolean
    isApproved: Boolean
    isListed: Boolean
    price: Float
    ownerUserId: User
  }
  type NftUser {
    _id: ID
    username: String
    avatar_url: String
    isVerified: Boolean
  }

  type NftWithUser {
    _id: ID
    name: String
    tokenId: Int
    ipfsUrl: String
    imageUrl: String
    category: String
    chainId: Int
    network: String
    ownerAddress: String
    creatorAddress: String
    contractAddress: String
    isMarketPlace: Boolean
    isApproved: Boolean
    isListed: Boolean
    price: Float
    user: NftUser
    tags: [String]
    unlockableContent: String
  }

  type Query {
    nfts: [AllNft]
    filterNfts(
      price_min: Float
      price_max: Float
      network: String
      category: String
      isListed: Boolean
    ): [Nft]
    getNFTObjectId(tokenId: Int, network: String): Nft
    getNftsOfUser(ownerAddress: String): [Nft]
    searchNfts(key: String): [Nft]
    getNftDetails(contractAddress: String, tokenId: Int): NftWithUser
  }
  type Mutation {
    createNft(
      name: String
      tokenId: Int
      ipfsUrl: String
      imageUrl: String
      chainId: Int
      network: String
      ownerAddress: String
      creatorAddress: String
      contractAddress: String
      category: String
      tags: [String]
      unlockableContent: String
    ): Nft
    nftUpdate(price: Float, nftId: String, isMarketPlace: Boolean): Nft
    nftListed(nftId: String, isListed: Boolean): Nft
    nftApproved(isApproved: Boolean, nftId: String): Nft
    nftOwnerUpdate(ownerAddress: String, nftId: String): Nft
  }
`;
export const nftResolvers = {
  Query: {
    nfts: async () => {
      const data = await NftModel.find().populate("ownerUserId");
      return data;
    },

    filterNfts: async (root, args) => {
      const filters = {};

      if (args.price_min !== null && args.price_max !== null) {
        filters.price = { $gte: args.price_min, $lte: args.price_max };
      }

      args.network !== "" ? (filters.network = args.network) : null;
      args.category !== "" ? (filters.category = args.category) : null;
      args.isListed
        ? (filters.isListed = args.isListed)
        : (filters.isListed = args.isListed);
      let data;
      await NftModel.aggregate([
        {
          $match: filters,
        },
        { $unwind: "$ownerUserId" },
        {
          $lookup: {
            from: "users",
            localField: "ownerUserId",
            foreignField: "_id",
            as: "ownerUserId",
          },
        },
      ])
        .then(async (res) => {
          data = res;
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
      return data;
    },

    getNftsOfUser: async (root, args) => {
      const nfts = await NftModel.find({ ownerAddress: args.ownerAddress });
      const nft = await NftModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "ownerAddress",
            foreignField: "address",
            as: "users",
          },
        },
      ]);
      return nfts;
    },

    searchNfts: async (root, args) => {
      const key = args.key;
      const nfts = await NftModel.find({
        isApproved: true,
        name: { $regex: key, $options: "i" },
      });
      return nfts;
    },
    getNftDetails: async (root, args) => {
      const nfts = await NftModel.findOne({
        contractAddress: args.contractAddress,
        tokenId: args.tokenId,
      });

      const nft = await NftModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "nfts",
            as: "user",
          },
        },
        {
          $match: {
            contractAddress: args.contractAddress,
            tokenId: args.tokenId,
          },
        },
        {
          $unwind: "$user",
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      console.log(nft);
      return nft[0];
    },
    getNFTObjectId: async (root, args) => {
      const nfts = await NftModel.findOne(args);
      return nfts;
    },
  },

  Mutation: {
    createNft: async (root, args) => {
      let nft = new NftModel(args);
      const wallet = await walletModel.findOne({
        address: args.ownerAddress,
      });
      // nft.ownerUserId
      const user = await UserModel.findById(wallet.user);
      console.log(user.nfts);
      nft.ownerUserId = wallet.user;
      user.nfts.push(nft);
      await nft.save().then(() => {
        user.save();
      });
      return nft;
    },
    nftUpdate: async (root, args) => {
      const nft = await NftModel.findByIdAndUpdate(
        args.nftId,
        {
          $set: args,
        },
        {
          new: true,
        }
      );

      return nft;
    },
    nftApproved: async (root, args) => {
      const nft = await NftModel.findByIdAndUpdate(
        args.nftId,
        {
          $set: args,
        },
        {
          new: true,
        }
      );
      return nft;
    },
    nftOwnerUpdate: async (root, args) => {
      const nft = await NftModel.findByIdAndUpdate(
        args.nftId,
        {
          $set: args,
        },
        {
          new: true,
        }
      );
      return nft;
    },
    nftListed: async (root, args) => {
      const nft = await NftModel.findByIdAndUpdate(
        args.nftId,
        {
          $set: args,
        },
        {
          new: true,
        }
      );

      return nft;
    },
  },
};
