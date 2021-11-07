import Busboy from "busboy";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

import { logger } from "./logger.js";

export class UploadHandler {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.ON_UPLOAD_EVENT = "file-upload";
  }

  canExecute(lastExecution) {}

  // A função abaixo é chamada com ( * ) porque é um async iterator
  // O atributo "yield" retorna o valor para finalizar o laço, mas não para a execução ali como faz o "return"

  handleFileBuffer(filename) {
    this.lastFileSent = Date.now();

    async function* handleData(source) {
      let processedAlready = 0;

      for await (const chunk of source) {
        yield chunk;

        processedAlready += chunk.length;

        if (!this.canExecute(this.lastFileSent)) continue;

        this.io.to(this.socketId).emit(this.ON_UPLOAD_EVENT, {
          processedAlready,
          filename: chunk.filename,
        });
        logger.info(
          `File [${filename}] got ${processedAlready} bytes to ${this.socketId}`
        );
      }
    }
    return handleData.bind(this);
  }

  async onFile(fieldname, file, filename) {
    const saveTo = `${this.downloadsFolder}/${filename}`;

    await promisify(pipeline).bind(this)(
      file, //Readable stream
      this.handleFileBuffer(filename), //Transform stream
      fs.createWriteStream(saveTo) // Writable stream
    ),
      logger.info(`File [${filename}] finished successfully`);
  }

  registerEvents(headers, onFinished) {
    const busboy = new Busboy({ headers });

    busboy.on("file", this.onFile.bind(this));
    busboy.on("finish", onFinished);

    return busboy;
  }
}
