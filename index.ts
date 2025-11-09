import { config } from "./src/config/config.ts";
import app from "./src/server.ts";
import connectDB from "./src/config/db.ts";
import { initSocket } from "./src/config/socket.ts";
import http from "http";

const port = config.port || 3000;

const createServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () =>
    console.log("server is running - " + "http://localhost:" + port)
  );
};

createServer();
