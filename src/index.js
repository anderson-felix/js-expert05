import https from "https";
import fs from "fs";
import { Server } from "socket.io";

import { logger } from "./logger.js";
import { Router } from "./routes.js";

const PORT = process.env.PORT || 3000;

const localHostSSL = {
  key: fs.readFileSync("./certificates/key.pem"),
  cert: fs.readFileSync("./certificates/cert.pem"),
};

const router = new Router();

const server = https.createServer(localHostSSL, router.handler.bind(router));

const io = new Server(server, {
  cors: {
    credentials: false,
    origin: "*",
  },
});

io.on("connection", (socket) => logger.info(`someone connected: ${socket.id}`));

const startServer = () => {
  const { address, port } = server.address();

  logger.info(`App running at https://${address}:${port}`);
};

server.listen(PORT, startServer);
