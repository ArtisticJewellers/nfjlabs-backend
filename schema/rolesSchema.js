import RoleModal from "../models/roleModel.js";
import { gql } from "apollo-server-express";
export const roleTypeDefs = gql`
  type Roles {
    _id: ID
    roleName: String
    royalty: Int
    royaltyAddress: String
  }

  type Query {
    getRole(_id: String): Roles
  }
  type Mutation {
    roleCreate(roleName: String): Roles
    roleRoyaltyUpdate(_id: String, royalty: Int): Roles
    roleRoyaltyAddressUpdate(_id: String, royaltyAddress: String): Roles
  }
`;

export const roleResolvers = {
  Query: {
    getRole: async (root, args) => {
      const role = await RoleModal.findById(args);
      return role;
    },
  },
  Mutation: {
    roleCreate: async (root, args) => {
      const role = await RoleModal(args);
      await role.save();
      return role;
    },
    roleRoyaltyUpdate: async (root, args) => {
      const role = await RoleModal.findByIdAndUpdate(
        { _id: args._id },
        {
          $set: { royalty: args.royalty },
        },
        { new: true }
      );
      console.log(role);
      return role;
    },
    roleRoyaltyAddressUpdate: async (root, args) => {
      const role = await RoleModal.findByIdAndUpdate(
        { _id: args._id },
        {
          $set: { royaltyAddress: args.royaltyAddress },
        },
        { new: true }
      );

      return role;
    },
  },
};
