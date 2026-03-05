"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsv = void 0;
var stream_1 = require("stream");
var csv_parser_1 = require("csv-parser");
var parseCsv = function (file) {
    return new Promise(function (resolve, reject) {
        var results = [];
        stream_1.Readable.from(file.buffer)
            .pipe((0, csv_parser_1.default)())
            .on("data", function (row) {
            results.push(row);
        })
            .on("end", function () {
            resolve(results);
        })
            .on("error", function (err) {
            reject(err);
        });
    });
};
exports.parseCsv = parseCsv;
