import { AppError, ValidationError } from '../errors/errors';

import { Request,Response,NextFunction, } from "express";

export const errorHandler=(err:Error,req:Request,res:Response,next:NextFunction)=>{
    if(err instanceof ValidationError){
        return res.status(err.statusCode).json({message:err.message,errors:err.errors})
    }
    if(err instanceof AppError){
        return res.status(err.statusCode).json({message:err.message})
    }
        return res.status(500).json({message:"Unexpected error occured",error:err.message})
} 
