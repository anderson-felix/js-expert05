import { logger } from "./logger.js";

export class Router {
  io;
  constructor() {}

  setSocketInstance(io) {
    this.io = io;
  }

  async defaultRoute(req, res) {
    res.end("hello dev");
  }

  async options(req, res) {
    res.writeHead(204);
    res.end("options");
  }

  async post(req, res) {
    logger.info("post");
    res.end();
  }

  async get(req, res) {
    logger.info("get");
    res.end();
  }

  async delete(req, res) {
    logger.info("delete");
    res.end();
  }

  handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const chosen = this[req.method.toLowerCase()] || this.defaultRoute;

    return chosen.apply(this, [req, res]);
  }
}
