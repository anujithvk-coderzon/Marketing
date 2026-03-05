"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
var multer_1 = require("multer");
var storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: storage });
