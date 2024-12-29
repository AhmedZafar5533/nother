require("dotenv").config({ path: (__dirname, "../.env") });

const express = require("express");
const morgan = require("morgan");
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRouter = require("./routes/app.route.js");
const messageRouter = require("./routes/messages.routes.js");
const cors = require("cors");
const { app, server, io } = require("./lib/socket.js");

const __dirname = path.resolve();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("tiny"));
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

mongoose
    .connect(process.env.DB_URL)
    .then(console.log("Database Connection Successful"))
    .catch((err) => console.log("Database Connection Failed", err));

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../frontend/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/build/index.html"));
    });
}

const PORT = process.env.PORT;

server.listen(PORT, () => console.log("Server running on port ", PORT));
