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
io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
    socket.emit("id", socket.id);
    socket.on("signal", ({ to, data }) => {
        io.to(to).emit("signal", {
            from: socket.id,
            data
        });
    });
    socket.on("connection established", ({ to }) => {
        io.to(to).emit("connection established", {
            from: socket.id,
        });
    });
    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});
httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map