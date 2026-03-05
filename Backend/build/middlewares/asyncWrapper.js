"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncWrapper = void 0;
const asyncWrapper = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncWrapper = asyncWrapper;
//# sourceMappingURL=asyncWrapper.js.map