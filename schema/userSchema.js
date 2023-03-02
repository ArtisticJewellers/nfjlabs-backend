import UserModel from "../models/userModel.js";
import WalletModel from "../models/walletModel.js";
import { gql } from "apollo-server-express";
import { GraphQLError } from "graphql";
import collectionModel from "../models/collectionModel.js";

export const userTypeDefs = gql`
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
    isMarketPlace: Boolean
    isApproved: Boolean
    price: Float
  }

  type User {
    _id: ID
    displayName: String
    username: String
    avatar_url: String
    about_details: String
    bg_image: String
    twitterUrl: String
    facebookUrl: String
    firstname: String
    lastname: String
    websiteUrl: String
    isVerified: Boolean
    wallets: [Wallet]
    following_list: [User]
    follower_list: [User]
    nfts: [Nft]
    kyc: Kyc
    isKycApproved: Boolean
    collections: [Collections]
  }

  type Collections {
    _id: ID
    collectionName: String
    collectionAddress: String
    collectionDesc: String
    bannerImageUrl: String
    avatarImage: String
    chain: String
    nfts: [Nft]
    user: User
  }

  type Wallet {
    _id: ID
    address: String
    isPrimary: Boolean
    user: User
  }

  type Query {
    users: [User]
    user(walletAddress: String): User
    wallets: [Wallet]
    wallet(address: String): Wallet
    walletId(walletId: String): Wallet
    signIn(walletAddress: String): Wallet
    getAllCollections: [Collections]
  }

  type Mutation {
    signUp(
      walletAddress: String
      lastname: String
      firstname: String
      username: String
      avatar_url: String
      bg_image: String
      about_details: String
      bg_image: String
      twitterUrl: String
      facebookUrl: String
      websiteUrl: String
    ): User

    linkWallet(walletAddress: String, userId: String): Wallet
    followUser(followId: String, userId: String): User
    updateUser(
      userId: String
      lastname: String
      firstname: String
      username: String
      avatar_url: String
      bg_image: String
      about_details: String
      bg_image: String
      twitterUrl: String
      facebookUrl: String
      websiteUrl: String
    ): User
    verifyUser(userId: String, isVerified: Boolean): User
    createCollection(
      username: String
      collectionName: String
      collectionDesc: String
      collectionAddress: String
      bannerImageUrl: String
      avatarUrl: String
      chain: String
      nfts: [String]
    ): User
    getCollectionsById(username: String): User
    deleteAllCollections: Collections
    removeCollection(collectionId: String): Collections
    getIndividualCollection(collectionId: String): Collections
    addNFToCollection(
      username: String
      collectionId: String
      nftId: String
    ): Nft
    changeIsVerified(userId: String): User
  }
`;

export const userResolvers = {
  Query: {
    getAllCollections: async (parent, args) => {
      let collections = await collectionModel.find();
      return collections;
    },
    users: async () => {
      const data = await UserModel.find()
        .populate("wallets")
        .populate("collections")
        .populate("nfts")
        .populate("kyc");
      return data;
    },
    user: async (root, args) => {
      const data = await WalletModel.findOne({
        address: args.walletAddress,
      }).populate("user");

      const userinfo = await UserModel.findById(data.user._id)
        .populate("nfts")
        .populate("kyc");
      return userinfo;
    },
    wallets: async () => {
      const data = await WalletModel.find();
      return data;
    },
    wallet: async (root, args) => {
      const data = await WalletModel.findOne({ address: args.address });
      return data;
    },
    walletId: async (root, args) => {
      const data = await WalletModel.findById({ _id: args.walletId });
      return data;
    },
    signIn: async (root, args) => {
      const data = await WalletModel.findOne({
        address: args.walletAddress,
      }).populate("user");
      return data;
    },
  },

  Mutation: {
    addNFToCollection: async (parent, args) => {
      let user = await UserModel.findOne({ username: args.username })
        .populate("collections")
        .populate("nfts");
      if (!user) throw new GraphQLError("Cannot Find This User");
      let collection = await collectionModel.findById(args.collectionId);
      // collection.nfts.push(args.nftId);
      if (!collection.nfts.includes(args.nftId)) {
        await collection.update({ $push: { nfts: args.nftId } });
      }
      console.log(user);
      return user;
    },
    getIndividualCollection: async (parent, args) => {
      let collection = await collectionModel
        .findById(args.collectionId)
        .populate("nfts");
      if (!collection) throw new GraphQLError("Cannot find this Colelction");
      return collection;
    },
    getCollectionsById: async (parent, args) => {
      let user = await UserModel.findOne({ username: args.username }).populate(
        "collections"
      );
      if (!user) throw new GraphQLError("Cannot find this user");
      console.log({ collectionsUser: user.collections });
      return user;
    },
    deleteAllCollections: async (parent, args) => {
      await collectionModel.collection.drop();
      let collections = await collectionModel.find();
      console.log({ collections });
      return collectionModel;
    },
    removeCollection: async (parent, args) => {
      let collection = await collectionModel.findById(args.collectionId);
      if (!collection) throw new GraphQLError("Cannot Find This Collection");
      let deletedCollection = await collection.deleteOne();
      return deletedCollection;
    },
    createCollection: async (parent, args) => {
      let user = await UserModel.findOne({ username: args.username })
        .populate("collections")
        .populate("nfts");
      if (!user) throw new GraphQLError("Cannot Find User");
      const {
        collectionName,
        collectionDesc,
        collectionAddress,
        bannerImageUrl,
        avatarUrl,
        chain,
        nfts,
      } = args;

      let newCollection = await collectionModel.create({
        user,
        collectionName,
        collectionDesc,
        collectionAddress,
        bannerImageUrl,
        avatarUrl,
        chain,
        nfts,
      });

      console.log({ newCollection });

      await user.update({ $push: { collections: newCollection } });
      // .populate({collections});
      console.log({ user });
      return user;
    },
    signUp: async (root, args) => {
      const user = new UserModel(args);
      const existingWallet = await WalletModel.findOne({
        address: args.walletAddress,
      });
      const wallet = new WalletModel({
        address: args.walletAddress,
        isPrimary: true,
      });
      user.wallets.push(wallet);
      const existingUser = await UserModel.findOne({
        username: args.username,
      });
      console.log(existingUser);
      if (existingUser) {
        throw new GraphQLError("User Already exists");
      } else {
        if (existingWallet) {
          throw new GraphQLError("Wallet Already exists");
        } else {
          user.save().then(() => {
            wallet.user = user;
            wallet.save();
          });
          return user;
        }
      }
    },

    linkWallet: async (root, args) => {
      const existingWallet = await WalletModel.findOne({
        address: args.walletAddress,
      });
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exist");
      } else {
        if (existingWallet) {
          throw new Error("Wallet Already exists");
        } else {
          const newWallet = new WalletModel({
            address: args.walletAddress,
            isPrimary: false,
            user: user,
          });
          user.wallets.push(newWallet);
          user.save();
          newWallet.save();
          return newWallet;
        }
      }
    },

    updateUser: async (root, args) => {
      const user = await UserModel.findByIdAndUpdate(
        args.userId,
        { $set: args },
        {
          new: true,
        }
      );
      return user;
    },

    followUser: async (root, args) => {
      const user = await UserModel.findById(args.userId);
      console.log(user.following_list.includes(args.followId));
      if (!user.following_list.includes(args.followId)) {
        const user = await UserModel.findByIdAndUpdate(
          args.followId,
          {
            $push: { follower_list: args.userId },
          },
          {
            new: true,
          }
        );
        await UserModel.findByIdAndUpdate(
          args.userId,
          {
            $push: { following_list: args.followId },
          },
          {
            new: true,
          }
        );
        return user;
      } else {
        const user = await UserModel.findByIdAndUpdate(
          args.followId,
          {
            $pull: { follower_list: args.userId },
          },
          {
            new: true,
          }
        );
        await UserModel.findByIdAndUpdate(
          args.userId,
          {
            $pull: { following_list: args.followId },
          },
          {
            new: true,
          }
        );
        return user;
      }
    },

    verifyUser: async (root, args) => {
      const user = await UserModel.findByIdAndUpdate(
        args.userId,
        { $set: args },
        {
          new: true,
        }
      );
      return user;
    },
  },
};
