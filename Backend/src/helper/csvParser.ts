import { Readable } from "stream";
import csv from "csv-parser";

export const parseCsv = (file: Express.Multer.File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    Readable.from(file.buffer)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
