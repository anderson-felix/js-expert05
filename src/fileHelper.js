import fs from "fs";
import prettyBytes from "pretty-bytes";

export class FileHelper {
  static async getFilesStatus(downloadFolder) {
    const currentFiles = await fs.promises.readdir(downloadFolder);

    const statuses = await Promise.all(
      currentFiles.map((file) => fs.promises.stat(`${downloadFolder}/${file}`))
    );

    const filesStatuses = [];

    statuses.forEach((status, index) => {
      const { size, birthtime } = status;
      filesStatuses.push({
        size: prettyBytes(size),
        lastModified: birthtime,
        owner: process.env.USER,
        file: currentFiles[index],
      });
    });

    return filesStatuses;
  }
}
