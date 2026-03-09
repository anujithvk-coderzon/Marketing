import { loginValidation, otpValidation, registerValidation } from './../helper/validation';
import { asyncWrapper } from "../middlewares/asyncWrapper";
import { Request,Response } from "express";
import { BadRequest, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../errors/errors';
import { prisma } from '../library/prisma';
import { compare, hash } from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import { redis } from '../helper/redis';
import { generateOTP,validateOtp,resendOTP } from '../helper/emailVerification';
import { sendEmails } from '../helper/emailService';

const USER_ERRORS={
    alreadyExist:"User already exist with this email address",
    notFound:"Account doesn't exist with this email",
    invalidPassword:"Incorrect password"
}

export const registerUser=asyncWrapper(async function (req:Request,res:Response) {
  const validate=registerValidation.safeParse(req.body)  
  if(!validate.success) throw new ValidationError(validate.error)
  const {email,name,password,phone}=validate.data;
  const existingUser=await prisma.user.findUnique({where:{email}})
  if(existingUser) throw new ConflictError(USER_ERRORS.alreadyExist)
  const hashedPassword=await hash(password,10);
  const corrected_number=Number(phone)
 const user_data=generateOTP(email,name,hashedPassword,corrected_number)
 const html=`
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">CODERZON</h1>
      <p style="margin:4px 0 0;color:#bfdbfe;font-size:11px;">Marketing Management System</p>
    </div>
    <div style="padding:32px 24px;text-align:center;">
      <p style="margin:0 0 8px;color:#475569;font-size:15px;">Hi <strong style="color:#1e293b;">${user_data.name}</strong>,</p>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Use the code below to verify your email address.</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;display:inline-block;min-width:200px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1e293b;">${user_data.otp}</span>
      </div>
      <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">This code expires in <strong style="color:#64748b;">10 minutes</strong>.</p>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} CODERZON. All rights reserved.</p>
    </div>
  </div>`
 sendEmails({to:email,subject:'Email Verification',body:html })
 return res.status(200).json({message:"Verification OTP send successfully"})
})

export const verifyEmailOTP=asyncWrapper(async function (req:Request,res:Response) {
  const validation=otpValidation.safeParse(req.body)
  if(!validation.success) throw new ValidationError(validation.error)
  const otp=validation.data.otp;
  const user_data=validateOtp(otp)
  if(!user_data) throw new BadRequest("Invalid or expired OTP")
  await prisma.user.create({data:{
    name:user_data.name,
    email:user_data.email,
    password:user_data.password,
    phone:user_data.phone
  }})
  return res.status(200).json({message:"User registered successfully"})
})
export const loginUser=asyncWrapper(async function (req:Request,res:Response) {
    const validation=loginValidation.safeParse(req.body);
    if(!validation.success) throw new ValidationError(validation.error)
    const {email,password}=validation.data;
    const existingUser=await prisma.user.findUnique({where:{email}})
    if(!existingUser) throw new NotFoundError(USER_ERRORS.notFound)
    const passwordValidate=await compare(password,existingUser.password)
    if(!passwordValidate) throw new BadRequest(USER_ERRORS.invalidPassword)
    const accessToken=jwt.sign({id:existingUser.id},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'1h'})
    const refreshToken=jwt.sign({id:existingUser.id},process.env.REFRESH_TOKEN_SECRET!,{expiresIn:'7d'})
    await redis.set(`refresh:${existingUser.id}`,refreshToken,{EX:7*24*60*60})
    res.cookie('refresh_token',refreshToken,{
            maxAge:7*24*60*60*1000,
            httpOnly:true,
            sameSite:true,
    })
    return res.status(200).json({message:"Login successfull",accessToken})
})

export const resendVerificationOTP=asyncWrapper(async function (req:Request,res:Response) {
  const {email}=req.body
  if(!email) throw new BadRequest("Email is required")
  const user_data=resendOTP(email)
  if(!user_data) throw new BadRequest("No pending verification found for this email")
  const html=`
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">CODERZON</h1>
      <p style="margin:4px 0 0;color:#bfdbfe;font-size:11px;">Marketing Management System</p>
    </div>
    <div style="padding:32px 24px;text-align:center;">
      <p style="margin:0 0 8px;color:#475569;font-size:15px;">Hi <strong style="color:#1e293b;">${user_data.name}</strong>,</p>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Here is your new verification code.</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;display:inline-block;min-width:200px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1e293b;">${user_data.otp}</span>
      </div>
      <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">This code expires in <strong style="color:#64748b;">10 minutes</strong>.</p>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} CODERZON. All rights reserved.</p>
    </div>
  </div>`
  sendEmails({to:email,subject:'Email Verification',body:html})
  return res.status(200).json({message:"OTP resent successfully"})
})

export const getMe=asyncWrapper(async function (req:Request,res:Response) {
  const userId=(req as any).user?.id
  if(!userId) throw new UnauthorizedError("Not authenticated")
  const user=await prisma.user.findUnique({
    where:{id:userId},
    select:{name:true,email:true,role:true}
  })
  if(!user) throw new NotFoundError("User not found")
  return res.status(200).json({message:"User fetched successfully",user})
})

