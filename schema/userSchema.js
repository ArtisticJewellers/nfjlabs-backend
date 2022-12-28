import UserModel from "../models/userModel.js";
import WalletModel from "../models/walletModel.js";
import kycModel from "../models/kycModel.js";
import { gql } from "apollo-server-express";
import { GraphQLError } from "graphql";

export const userTypeDefs = gql`
  type Kyc {
    wallet: String
    fname: String
    lname: String
    dob: String
    email: String
    phone: String
    address: String
    country: String
    identity: String
  }
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
    kyc: [Kyc]
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
  }

  type Mutation {
    kyc(
      wallet: String
      fname: String
      lname: String
      dob: String
      email: String
      phone: String
      address: String
      country: String
      identity: String
    ): Kyc
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
  }
`;

export const userResolvers = {
  Query: {
    users: async () => {
      const data = await UserModel.find().populate("wallets");
      return data;
    },

    user: async (root, args) => {
      //const data = await WalletModel.findOne({wallets: {$in: [args.walletAddress]}})
      const data = await WalletModel.findOne({
        address: args.walletAddress,
      }).populate("user");

      console.log(data.user._id);
      const userinfo = await UserModel.findById(data.user._id).populate("nfts");
      console.log(userinfo);
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
    kyc: async (root, args) => {
      let wallet = await UserModel.findOne(args.wallets);
      if (!wallet) {
        throw new GraphQLError("Cannot find User");
      }

      const kyc = new kycModel(args);
      return kyc;
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
