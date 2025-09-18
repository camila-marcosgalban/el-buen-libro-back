import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import ordersRouter from "./routes/orders.js";
import optionsRouter from "./routes/options.js";
import sandwichesRouter from "./routes/sandwiches.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_,res)=>res.json({ok:true, name:"El Buen Libro API"}));
app.use("/api/admin", adminRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/options", optionsRouter);
app.use("/api/sandwiches", sandwichesRouter);

const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join:order", ({ code }) => socket.join(`order:${code}`));
});

export const emitToOrder = (code, event, payload) => {
  io.to(`order:${code}`).emit(event, payload);
};

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log("API listening on", PORT));
});
