import { ZodError } from "zod";

export class AppError extends Error{
    statusCode:number
    constructor(message:string,statusCode:number){
        super(message);
        this.statusCode=statusCode
    }
}

export class UnauthorizedError extends AppError {
    constructor(message="Unauthorized"){
      super(message,401);
    }
}

export class NotFoundError extends AppError {
    constructor(message="Not Found"){
        super(message,404)
    }
}

export class BadRequest extends AppError {
    constructor(message="Bad Request"){
        super(message,400)
    }
}

export class ConflictError extends AppError {
 constructor(message="Already Exist"){
    super(message,409)
 }
}

  export class ValidationError extends AppError {
      errors: { field: string; message: string }[];
      constructor(zodError: ZodError) {
          super("Validation failed", 400);
          this.errors = zodError.issues.map(issue => ({
              field: issue.path.join("."),
              message: issue.message
          }));
      }
  }