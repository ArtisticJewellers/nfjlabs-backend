import CollectionModel from "../models/collectionModel.js"
import UserModel from "../models/userModel.js"
import {gql} from "apollo-server-express"

export const collectionTypeDefs = gql`
    type Collection {
        _id: ID
        collectionName: String
        collectionAddress: String
        bannerImageUrl: String
        avatarUrl: String
        chain: String
        nfts: [Nft]
        user: User
    }

    type Query {
       allCollections:  [Collection]
       singleCollection(id: String): Collection
    }

    type Mutation {
        createCollection(
            collectionName: String, 
            collectionAddress: String,
            avatarUrl: String,
            chain: String,
            userId: ID
        ): Collection
    }
`

export const collectionResolvers = {
    Query: {
        allCollections: async () => {
            const collections = await CollectionModel.find();
            return collections;
        },
        singleCollection: async (root, args) => {
            const collection = await CollectionModel.findById(args.id);
            return collection
        }
    },

    Mutation: {
        createCollection: async (root, args) => {
            const User = await UserModel.findById(args.userId)
            const collection = new CollectionModel({
                collectionName: args.collectionName,
                collectionAddress: args.collectionAddress,
                avatarUrl: args.avatarUrl,
                chain: args.chain,
                user: User
            });
            await collection.save()
            return collection;
        }
    }
}
