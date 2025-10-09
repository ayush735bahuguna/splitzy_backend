import mongoose from "mongoose";
import { config } from "./config.ts";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("connected to db");
    });
    mongoose.connection.on("error", (err) => {
      console.log("error in connection to db: ", err);
    });
    await mongoose.connect(config.mongoDB as string);
  } catch (error) {
    console.error("error in DB connection: " + error);
    process.exit(1);
  }
};

export default connectDB;
