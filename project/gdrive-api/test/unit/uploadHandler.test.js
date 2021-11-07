import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { logger } from "../../src/logger";

import { UploadHandler } from "../../src/uploadHandler";
import { TestUtil } from "../_utils/testUtil";

describe("#UploadHandler test suite", () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };

  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation(); //remove os logs do teste
  });

  describe("#registerEvents", () => {
    test("should call onFile and onFinished functions on Busboy instance", () => {
      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: "01",
      });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      const headers = {
        "content-type": "multipart/form-data; boundary=",
      };

      const onFinish = jest.fn();
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

      const fileStream = TestUtil.generateReadableStream([
        "chunk",
        "of",
        "data",
      ]);

      busboyInstance.emit("file", "fieldname", fileStream, "file.txt");
      busboyInstance.listeners("finish")[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalled();
    });
  });

  describe("#onFile", () => {
    test("given a stream file it should save it on disk", async () => {
      const handler = new UploadHandler({
        io: ioObj,
        socketId: "01",
        downloadsFolder: "/tmp",
      });

      const onData = jest.fn();
      jest
        .spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData));

      const onTransform = jest.fn();
      jest
        .spyOn(handler, handler.handleFileBuffer.name)
        .mockImplementation(() =>
          TestUtil.generateTransformStream(onTransform)
        );

      const chunks = ["hey", "dude"];
      const params = {
        fieldname: "video",
        file: TestUtil.generateReadableStream(chunks),
        filename: "mockFile.mov",
      };

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunks.join());
      expect(onTransform.mock.calls.join()).toEqual(chunks.join());

      const expectedFileName = `${handler.downloadsFolder}/${params.filename}`;

      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFileName);
    });
  });

  describe("#handleFileBuffer", () => {
    test("should call emit function and it is a transform stream", async () => {
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);

      const handler = new UploadHandler({
        io: ioObj,
        socketId: "01",
      });

      jest.spyOn(handler, handler.canExecute.name).mockReturnValueOnce(false);

      const messages = ["my", "name", "is", "cuca", "beludo"];
      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = TestUtil.generateWritableStream(onWrite);

      await promisify(pipeline).bind(this)(
        source,
        handler.handleFileBuffer("filename.txt"),
        target
      );

      // se o handleFileBuffer for um transform stream, nosso pipeline vai continuar o processo
      // passando os dados para frente e chamar nossa função no target a cada chunk

      expect(onWrite).toBeCalledTimes(messages.length);
      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });
  });

  describe("#canExecute", () => {
    test("", async () => {});
  });
});
