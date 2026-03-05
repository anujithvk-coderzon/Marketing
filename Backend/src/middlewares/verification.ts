import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request,Response } from 'express'
import { UnauthorizedError } from '../errors/errors'
import { redis } from '../helper/redis'

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
          if(err){
          return  res.status(401).json({message:"Please login"})
          
          };
          req.user=data as AuthPayload 
          next() 
        })
    } catch (error:any) {
        res.status(500).json({message:"Unexpected error occured",error:error.message})
    }
}

export const refresh_Token=async function (req:Request,res:Response) {
    try {
        const r_token=req.cookies.refresh_token;
        if(!r_token){
            return res.status(401).json({message:"Please login"})
        }
        const payload= jwt.verify(r_token,process.env.REFRESH_TOKEN_SECRET!) as AuthPayload
        const storedToken = await redis.get(`refresh:${payload.id}`)
        if(!storedToken){
            return res.status(401).json({message:"Session expired"})
        }
        if(r_token !== storedToken){
            return res.status(401).json({message:"Invalid token"})
        }
        const new_accesstoken=jwt.sign({id:payload.id},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'15m'})
        return res.status(200).json({token:new_accesstoken}) 
    } catch (error:any) {
        return res.status(500).json({message:"Unexpected error occured",error:error.message})
    }
}