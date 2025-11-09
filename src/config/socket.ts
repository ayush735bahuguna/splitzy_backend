import { Server as IOServer, Socket } from "socket.io";
import http from "http";

let io: IOServer;

export const initSocket = (server: http.Server) => {
  io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[${socket.id}] connected`);

    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined personal room`);
    });

    socket.on("join:group", async ({ groupId, user }) => {
      socket.join(`group:${groupId}`);
      console.log(`👥 ${user.name} joined group ${groupId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[${socket.id}] disconnected`);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
};

export const getIO = (): IOServer => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized! Call initSocket(server) first."
    );
  }
  return io;
};
