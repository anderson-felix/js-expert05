import { describe, test, expect, jest } from "@jest/globals";
import fs from "fs";
import prettyBytes from "pretty-bytes";

import { FileHelper } from "../../src/fileHelper.js";

describe("#FileHelper", () => {
  describe("#getFileStatus", () => {
    test("it should return files status in correct format", async () => {
      const statMock = {
        dev: 66306,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 25699812,
        size: 7943496,
        blocks: 15520,
        atimeMs: 1631056395293.6365,
        mtimeMs: 1631056395192,
        ctimeMs: 1631056395185.6382,
        birthtimeMs: 1631055900481.8877,
        atime: "2021-09-07T23:13:15.294Z",
        mtime: "2021-09-07T23:13:15.192Z",
        ctime: "2021-09-07T23:13:15.186Z",
        birthtime: "2021-09-07T23:05:00.482Z",
      };

      const mockUser = "anderson_felix";
      const filename = "video_teste.mp4";

      process.env.USER = mockUser;

      // aqui eu garanto que os testes não vão usar o file system (fs) do sistema operacional e sim como foi descrito acima usando os mocks.
      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);

      jest
        .spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFilesStatus("/tmp");

      const expectedResult = [
        {
          size: prettyBytes(statMock.size),
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});
