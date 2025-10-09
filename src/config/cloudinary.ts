import { v2 as cloudinary } from "cloudinary";
import { config } from "./config.ts";

cloudinary.config({
  cloud_name: config.cloudName as string,
  api_key: config.apiKey as string,
  api_secret: config.apiSecret as string,
});

export default cloudinary;
