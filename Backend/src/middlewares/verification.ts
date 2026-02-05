import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request,Response } from 'express'
import { UnauthorizedError } from '../errors/errors'

interface AuthPayload extends JwtPayload{
    id:string
}
type Requests=Request&{
    user?:AuthPayload
}

export const verify=async function (req:Requests,res:Response,next:NextFunction) {
    try {
        const head=req.headers.authorization
        const token=head?.split(' ')[1]
        if(!token) throw new UnauthorizedError("No token provided")
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!,(err,data)=>{
          if(err){ throw new UnauthorizedError("Please login to continue")};
          req.user=data as AuthPayload 
          next() 
        })
    } catch (error:any) {
        res.status(500).json({message:"Unexpected error occured",error:error.message})
    }
}