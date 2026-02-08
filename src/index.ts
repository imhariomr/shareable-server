import express from "express";
import "dotenv/config";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});
const peerToSocket = new Map(); 
io.on("connection", (socket) => {
  const peerId = socket.handshake.auth.peerId;

  if (!peerId) {
    console.log("No peerId, disconnecting");
    socket.disconnect();
    return;
  }
  peerToSocket.set(peerId, socket.id);

  socket.on("signal", ({ toPeerId, data }) => {
    const targetSocketId = peerToSocket.get(toPeerId);

    if (!targetSocketId) {
      console.log("Target peer offline:", toPeerId);
      return;
    }

    io.to(targetSocketId).emit("signal", {
      fromPeerId: peerId,
      data
    });
  });

  socket.on("connection-established", ({ toPeerId }) => {
    const targetSocketId = peerToSocket.get(toPeerId);

    if (!targetSocketId) return;

    io.to(targetSocketId).emit("connection-established", {
      fromPeerId: peerId
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected peer:", peerId);
    peerToSocket.delete(peerId);
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
