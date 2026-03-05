"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../errors/errors");
const errorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.ValidationError) {
        return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: "Unexpected error occured", error: err.message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map