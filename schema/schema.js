import { userTypeDefs, userResolvers } from "./userSchema.js";
import { nftTypeDefs, nftResolvers } from "./nftSchema.js";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { creatorResolvers, creatorTypeDefs } from "./creatorSchema.js";
import { transResolvers, transTypeDefs } from "./transactionSchema.js";
import { roleResolvers, roleTypeDefs } from "./rolesSchema.js";
import { kycResolvers, kycTypeDefs } from "./kycSchema.js";
const types = [
  userTypeDefs,
  nftTypeDefs,
  creatorTypeDefs,
  transTypeDefs,
  roleTypeDefs,
  kycTypeDefs,
];
const resolv = [
  userResolvers,
  nftResolvers,
  creatorResolvers,
  transResolvers,
  roleResolvers,
  kycResolvers,
];

export const typeDefs = mergeTypeDefs(types);
export const resolvers = mergeResolvers(resolv);
