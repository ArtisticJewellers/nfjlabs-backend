import { gql } from "apollo-server-express";
import KycModel from "../models/kycModel.js";
import WalletModel from "../models/walletModel.js";

import User from "../models/userModel.js";
import { GraphQLError } from "graphql";
export const kycTypeDefs = gql`
  type Kyc {
    _id: ID
    fname: String
    lname: String
    userWallet: String
    isApproved: Boolean
    dob: String
    email: String
    phone: String
    address: String
    country: String
    identity: String
  }

  # Queries
  type Query {
    getAllKyc: [Kyc!]!
  }

  # Mutations
  type Mutation {
    approveUserKyc(userId: String): User
    getKycByWalletId(walletId: String): Kyc
    deleteKycById(userId: String): Kyc
    deleteAllKyc: [Kyc]
    createKyc(
      username: String
      userWallet: String
      fname: String
      lname: String
      dob: String
      email: String
      phone: String
      address: String
      country: String
      identity: String
    ): User
  }
`;

export const kycResolvers = {
  Query: {
    async getAllKyc() {
      let kycs = await KycModel.find();
      return kycs;
    },
  },

  Mutation: {
    getKycByWalletId: async (parent, args) => {
      let kyc = await KycModel.findOne({ userWallet: args.walletId });
      if (!kyc) throw new GraphQLError("Kyc is not done");
      return kyc;
    },
    approveUserKyc: async (parent, args) => {
      const { userId } = args;
      let user = await User.findById(userId);
      console.log(user.isKycApproved);
      if (!user) throw GraphQLError("Cannot Find The User");
      if (user.isKycApproved) {
        await User.findByIdAndUpdate(userId, {
          $set: { isKycApproved: false },
        });
      } else {
        await User.findByIdAndUpdate(userId, { $set: { isKycApproved: true } });
      }

      return user;
      // let kyc = await KycModel.findOne({ userWallet: args.walletId });
      // if (kyc.isApproved) {
      //   await KycModel.findOneAndUpdate({
      //     user: args.userId,
      //     isApproved: false,
      //   });
      // } else {
      //   await KycModel.findOneAndUpdate({
      //     user: args.userId,
      //     isApproved: true,
      //   });
      // }
      // return kyc;
    },
    async deleteAllKyc() {
      let kycs = await KycModel.deleteMany();
      return kycs;
    },
    async deleteKycById(parent, args) {
      let kyc = await KycModel.deleteOne({ user: args.userId });
      return kyc;
    },
    async createKyc(parent, args) {
      let user = await User.findOne({ username: args.username });
      if (!user) throw new GraphQLError("Cannot Find User");

      const {
        fname,
        lname,
        dob,
        email,
        phone,
        address,
        country,
        identity,
        userWallet,
      } = args;

      let kyc = await KycModel.findOne({
        fname,
        lname,
        phone,
        userWallet,
      });
      if (kyc) throw new GraphQLError("kyc already done");

      let newKyc = await KycModel.create({
        user: user.id,
        userWallet,
        fname,
        lname,
        dob,
        email,
        phone,
        address,
        country,
        identity,
      });

      user.kyc = newKyc;
      return user;
    },
  },
};
