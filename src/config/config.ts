import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  mongoDB: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  // frontendDomain: process.env.FRONTEND_DOMAIN,
  frontendDomain: "*",
};

export const config = Object.freeze(_config);
