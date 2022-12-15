//libraries
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { ApolloServer, gql } from "apollo-server-express";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./schema/schema.js";

dotenv.config();

//modules
import dbConfig from "./config/database.config.js";
import userRouter from "./routes/userRoute.js";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();

const app = express();
app.use(cors());
//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
apolloServer.applyMiddleware({ app });

mongoose.Promise = global.Promise;
//Db Connection
console.log(dbConfig);
mongoose
  .connect(dbConfig, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

//Routes
// app.use("/api/ethers", ethersRouter);
app.use("/api/user", userRouter);

// listen for requests
app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
