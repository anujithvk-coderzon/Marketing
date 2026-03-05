"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.BadRequest = exports.NotFoundError = exports.UnauthorizedError = exports.AppError = void 0;
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(message, statusCode) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
var UnauthorizedError = /** @class */ (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError(message) {
        if (message === void 0) { message = "Unauthorized"; }
        return _super.call(this, message, 401) || this;
    }
    return UnauthorizedError;
}(AppError));
exports.UnauthorizedError = UnauthorizedError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        if (message === void 0) { message = "Not Found"; }
        return _super.call(this, message, 404) || this;
    }
    return NotFoundError;
}(AppError));
exports.NotFoundError = NotFoundError;
var BadRequest = /** @class */ (function (_super) {
    __extends(BadRequest, _super);
    function BadRequest(message) {
        if (message === void 0) { message = "Bad Request"; }
        return _super.call(this, message, 400) || this;
    }
    return BadRequest;
}(AppError));
exports.BadRequest = BadRequest;
var ConflictError = /** @class */ (function (_super) {
    __extends(ConflictError, _super);
    function ConflictError(message) {
        if (message === void 0) { message = "Already Exist"; }
        return _super.call(this, message, 409) || this;
    }
    return ConflictError;
}(AppError));
exports.ConflictError = ConflictError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(zodError) {
        var _this = _super.call(this, "Validation failed", 400) || this;
        _this.errors = zodError.issues.map(function (issue) { return ({
            field: issue.path.join("."),
            message: issue.message
        }); });
        return _this;
    }
    return ValidationError;
}(AppError));
exports.ValidationError = ValidationError;
