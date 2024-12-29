    const socket = require("socket.io");
    const express = require("express");
    const http = require("http");

    const app = express();
    const server = http.createServer(app);

    const io = new socket.Server(server, {
        cors: {
            origin: ["http://localhost:3000"],
        },
    });

    const userSocketMap = {};

    const getSocketId = (userId) => {
        return userSocketMap[userId];
    };

    io.on("connection", async (socket) => {
        // Extract userId from the handshake query
        const userId = socket.handshake.query.userId;

        if (!userId) {
            console.warn(
                `Invalid connection: Missing userId for socket ${socket.id}`
            );
            return;
        }

        // Handle duplicate connections
        if (userSocketMap[userId] && userSocketMap[userId] !== socket.id) {
            const oldSocketId = userSocketMap[userId];
            io.to(oldSocketId).disconnectSockets(true); // Disconnect old socket
        }

        // Update the user-socket map
        userSocketMap[userId] = socket.id;

        // Emit the updated online users list
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            if (userSocketMap[userId]) {
                delete userSocketMap[userId];

                io.emit("getOnlineUsers", Object.keys(userSocketMap));
            }
        });
    });

    module.exports = { io, app, server, getSocketId };
            