import { config } from "./src/config/config.ts";
import app from "./src/server.ts";
import connectDB from "./src/config/db.ts";

const createServer = async () => {
  await connectDB();

  const port = config.port || 3000;

  app.listen(port, () => {
    console.log("server is running - " + "http://localhost:" + port);
  });
};

createServer();
