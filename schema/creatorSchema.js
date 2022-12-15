import CreatorModel from "../models/CreatorModel.js";
import UserModel from "../models/userModel.js";
import { gql } from "apollo-server-express";

export const creatorTypeDefs = gql`
  type Creators {
    popularCollection: String
    users: [User]
  }

  type FeatureNft {
    popularCollection: String
    featuredNft: [Nft]
  }

  type TrendingNft {
    popularCollection: String
    trendingNft: [Nft]
  }

  type BannerNft {
    popularCollection: String
    bannerNft: Nft
  }

  type Query {
    allCreators: [Creators]
    allArtist(popularCollection: String): Creators
    allFeatureNft(popularCollection: String): FeatureNft
    allTrendingNft(popularCollection: String): TrendingNft
    bannerNft(popularCollection: String): BannerNft
  }
  type Mutation {
    addCreator(userId: String, popularCollectionId: String): Creators
    createPopularCollection(popularCollection: String): Creators
    addFeatureNft(popularCollectionId: String, nftId: String): FeatureNft
    addTrendingNft(popularCollectionId: String, nftId: String): TrendingNft
    addBannerNft(popularCollectionId: String, nftId: String): BannerNft
    removeArtist(popularCollection: String, userId: String): Creators
    removeFeatureNft(popularCollection: String, nftId: String): FeatureNft
    removeBannerNft(popularCollection: String, nftId: String): BannerNft
    removeTrendingNft(popularCollection: String, nftId: String): TrendingNft
  }
`;

export const creatorResolvers = {
  Query: {
    allCreators: async () => {
      const creators = await CreatorModel.find().populate("users");
      return creators;
    },
    allArtist: async (root, args) => {
      const creators = await CreatorModel.findOne({
        popularCollection: args.popularCollection,
      }).populate("users");

      return creators;
    },
    allFeatureNft: async (root, args) => {
      const creators = await CreatorModel.findOne({
        popularCollection: args.popularCollection,
      }).populate("featuredNft");
      return creators;
    },
    allTrendingNft: async (root, args) => {
      const creators = await CreatorModel.findOne({
        popularCollection: args.popularCollection,
      }).populate("trendingNft");
      return creators;
    },
    bannerNft: async (root, args) => {
      const creators = await CreatorModel.findOne({
        popularCollection: args.popularCollection,
      }).populate("bannerNft");
      return creators;
    },
  },

  Mutation: {
    addCreator: async (root, args) => {
      const creators = await CreatorModel.findById(args.popularCollectionId);
      if (!creators.users.includes(args.userId)) {
        creators.users.push(args.userId);
        creators.save();
        return creators;
      }
      return;
    },

    addFeatureNft: async (root, args) => {
      const creators = await CreatorModel.findById(args.popularCollectionId);
      if (!creators.featuredNft.includes(args.nftId)) {
        creators.featuredNft.push(args.nftId);
        creators.save();
        return creators;
      }

      return;
    },
    addTrendingNft: async (root, args) => {
      const creators = await CreatorModel.findById(args.popularCollectionId);

      if (!creators.trendingNft.includes(args.nftId)) {
        creators.trendingNft.push(args.nftId);
        creators.save();
        return creators;
      }
      return;
    },
    addBannerNft: async (root, args) => {
      const creators = await CreatorModel.findById(args.popularCollectionId);
      creators.bannerNft = args.nftId;
      creators.save();
      return creators;
    },

    createPopularCollection: async (root, args) => {
      const creators = await CreatorModel({
        popularCollection: args.popularCollection,
      });
      creators.save();

      return creators;
    }, // Remove NFts
    removeFeatureNft: async (root, args) => {
      const nft = await CreatorModel.updateOne(
        { popularCollection: args.popularCollection },
        {
          $pullAll: {
            featuredNft: [{ _id: args.nftId }],
          },
        },
        {
          new: true,
        }
      );
      return nft;
    },
    removeTrendingNft: async (root, args) => {
      const nft = await CreatorModel.updateOne(
        { popularCollection: args.popularCollection },
        {
          $pullAll: {
            trendingNft: [{ _id: args.nftId }],
          },
        },
        {
          new: true,
        }
      );
      return nft;
    },
    removeBannerNft: async (root, args) => {
      const nft = await CreatorModel.updateOne(
        { popularCollection: args.popularCollection },
        {
          bannerNft: args.nftId,
        },
        {
          new: true,
        }
      );
      return nft;
    },
    removeArtist: async (root, args) => {
      const nft = await CreatorModel.updateOne(
        { popularCollection: args.popularCollection },
        {
          $pullAll: {
            users: [{ _id: args.userId }],
          },
        },
        {
          new: true,
        }
      );
      return nft;
    },
  },
};
