import { gql } from "apollo-server-express";
import KycModel from "../models/kycModel.js";
import User from "../models/userModel.js";
import { GraphQLError } from "graphql";
export const kycTypeDefs = gql`
  type Kyc {
    fname: String
    lname: String
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
    deleteAllKyc: [Kyc]
    createKyc(
      username: String
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
    async deleteAllKyc() {
      let kycs = await KycModel.deleteMany();
      return kycs;
    },
    async createKyc(parent, args) {
      let user = await User.findOne({ username: args.username });
      if (!user) throw new GraphQLError("Cannot Find User");
      const { fname, lname, dob, email, phone, address, country, identity } =
        args;

      let newKyc = await KycModel.create({
        user: user.id,
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

      console.log({ updatedUser: user });

      return user;
    },
  },
};
