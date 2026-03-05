import { ZodError } from "zod";
export declare class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class BadRequest extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    errors: {
        field: string;
        message: string;
    }[];
    constructor(zodError: ZodError);
}
//# sourceMappingURL=errors.d.ts.map