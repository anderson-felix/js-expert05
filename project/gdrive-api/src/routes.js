import { FileHelper } from "./fileHelper.js";
import { logger } from "./logger.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

//import.meta.url é igual a url do meu diretório atual, o fileURLToPath vai montar um caminho com base nessa url
//MOTIVO: NODE VERSÃO 16 NÃO TEM MAIS A PROPRIEDADE __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultFolder = resolve(__dirname, "..", "downloads");

export class Router {
  io;
  constructor(downloadsFolder = defaultFolder) {
    this.downloadsFolder = downloadsFolder;
    this.fileHelper = FileHelper;
  }

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
    const result = await this.fileHelper.getFilesStatus(this.downloadsFolder);
    res.writeHead(200);
    res.end(JSON.stringify(result));
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
