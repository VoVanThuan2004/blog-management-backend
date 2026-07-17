import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt.utils.js";

let io: Server;

interface SocketUser {
  userId: string;
  fullName: string;
  roles: string[];
}

interface AuthenticatedSocket extends Socket {
  user: SocketUser;
}

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env["CLIENT_URL"] || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth["token"] || socket.handshake.query["token"];
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = verifyToken(token as string);
    if (!payload) {
      return next(new Error("Invalid token"));
    }

    (socket as AuthenticatedSocket).user = payload;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const authedSocket = socket as AuthenticatedSocket;
    console.log(`User connected: ${authedSocket.user.fullName}`);

    authedSocket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
