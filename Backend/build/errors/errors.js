"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.BadRequest = exports.NotFoundError = exports.UnauthorizedError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class NotFoundError extends AppError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequest extends AppError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}
exports.BadRequest = BadRequest;
class ConflictError extends AppError {
    constructor(message = "Already Exist") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    errors;
    constructor(zodError) {
        super("Validation failed", 400);
        this.errors = zodError.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
        }));
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map