import { userTypeDefs, userResolvers } from "./userSchema.js";
import { nftTypeDefs, nftResolvers } from "./nftSchema.js";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { creatorResolvers, creatorTypeDefs } from "./creatorSchema.js";
import { transResolvers, transTypeDefs } from "./transactionSchema.js";
import { roleResolvers, roleTypeDefs } from "./rolesSchema.js";

const types = [
  userTypeDefs,
  nftTypeDefs,
  creatorTypeDefs,
  transTypeDefs,
  roleTypeDefs,
];
const resolv = [
  userResolvers,
  nftResolvers,
  creatorResolvers,
  transResolvers,
  roleResolvers,
];

export const typeDefs = mergeTypeDefs(types);
export const resolvers = mergeResolvers(resolv);
