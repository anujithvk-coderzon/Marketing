import { loginValidation, registerValidation } from './../helper/validation';
import { asyncWrapper } from "../middlewares/asyncWrapper";
import { Request,Response } from "express";
import { BadRequest, ConflictError, NotFoundError, ValidationError } from '../errors/errors';
import { prisma } from '../library/prisma';
import { compare, hash } from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import { redis } from '../helper/redis';

const USER_ERRORS={
    alreadyExist:"User already exist with this email address",
    invalidData:"Invalid email or password"
}

export const registerUser=asyncWrapper(async function (req:Request,res:Response) {
  const validate=registerValidation.safeParse(req.body)  
  if(!validate.success) throw new ValidationError(validate.error)
  const {email,name,password}=validate.data;
  const existingUser=await prisma.user.findUnique({where:{email}})
  if(existingUser) throw new ConflictError(USER_ERRORS.alreadyExist)
  const hashedPassword=await hash(password,10);
  await prisma.user.create({data:{
    name,
    email,
    password:hashedPassword
  }})
    return res.status(200).json({message:"User registered successfully"})
})

export const loginUser=asyncWrapper(async function (req:Request,res:Response) {
    const validation=loginValidation.safeParse(req.body);
    if(!validation.success) throw new ValidationError(validation.error)
    const {email,password}=validation.data;
    const existingUser=await prisma.user.findUnique({where:{email}})
    if(!existingUser) throw new BadRequest(USER_ERRORS.invalidData)
    const passwordValidate=await compare(password,existingUser.password)
    if(!passwordValidate) throw new BadRequest(USER_ERRORS.invalidData)
    const accessToken=jwt.sign({id:existingUser.id},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'1h'})
    const refreshToken=jwt.sign({id:existingUser.id},process.env.REFRESH_TOKEN_SECRET!,{expiresIn:'7d'})
    await redis.set(`refresh:${existingUser.id}`,refreshToken,{EX:7*24*60*60})
    res.cookie('refresh_token',refreshToken,{
            maxAge:7*24*60*60,
            httpOnly:true,
            sameSite:true,
    })
    return res.status(200).json({message:"Login successfull",accessToken})
})

