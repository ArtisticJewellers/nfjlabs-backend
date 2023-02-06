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
    getKycbyUserId(userId: String): Kyc

    getAllKyc: [Kyc!]!
  }

  # Mutations
  type Mutation {
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
    getKycbyUserId: async (parent, args) => {
      let kyc = await KycModel.findOne({ user: args.userId });
      if (!kyc) throw new GraphQLError("Kyc is not done");
      return kyc;
    },
  },

  Mutation: {
    getKycByWalletId: async (parent, args) => {
      let kyc = await KycModel.findOne({ userWallet: args.walletId });
      if (!kyc) throw new GraphQLError("Kyc is not done");
      return kyc;
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
