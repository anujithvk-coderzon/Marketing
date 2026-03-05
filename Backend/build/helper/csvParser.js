"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsv = void 0;
const stream_1 = require("stream");
const csv_parser_1 = __importDefault(require("csv-parser"));
const parseCsv = (file) => {
    return new Promise((resolve, reject) => {
        const results = [];
        stream_1.Readable.from(file.buffer)
            .pipe((0, csv_parser_1.default)())
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
exports.parseCsv = parseCsv;
//# sourceMappingURL=csvParser.js.map