"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resendVerificationOTP = exports.loginUser = exports.verifyEmailOTP = exports.registerUser = void 0;
const validation_1 = require("./../helper/validation");
const asyncWrapper_1 = require("../middlewares/asyncWrapper");
const errors_1 = require("../errors/errors");
const prisma_1 = require("../library/prisma");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../helper/redis");
const emailVerification_1 = require("../helper/emailVerification");
const emailService_1 = require("../helper/emailService");
const USER_ERRORS = {
    alreadyExist: "User already exist with this email address",
    invalidData: "Invalid email or password"
};
exports.registerUser = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validate = validation_1.registerValidation.safeParse(req.body);
    if (!validate.success)
        throw new errors_1.ValidationError(validate.error);
    const { email, name, password, phone } = validate.data;
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new errors_1.ConflictError(USER_ERRORS.alreadyExist);
    const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
    const corrected_number = Number(phone);
    const user_data = (0, emailVerification_1.generateOTP)(email, name, hashedPassword, corrected_number);
    const html = `
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
  </div>`;
    (0, emailService_1.sendEmails)({ to: email, subject: 'Email Verification', body: html });
    return res.status(200).json({ message: "Verification OTP send successfully" });
});
exports.verifyEmailOTP = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.otpValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const otp = validation.data.otp;
    const user_data = (0, emailVerification_1.validateOtp)(otp);
    if (!user_data)
        throw new errors_1.BadRequest("Invalid or expired OTP");
    await prisma_1.prisma.user.create({ data: {
            name: user_data.name,
            email: user_data.email,
            password: user_data.password,
            phone: user_data.phone
        } });
    return res.status(200).json({ message: "User registered successfully" });
});
exports.loginUser = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.loginValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { email, password } = validation.data;
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!existingUser)
        throw new errors_1.BadRequest(USER_ERRORS.invalidData);
    const passwordValidate = await (0, bcrypt_1.compare)(password, existingUser.password);
    if (!passwordValidate)
        throw new errors_1.BadRequest(USER_ERRORS.invalidData);
    const accessToken = jsonwebtoken_1.default.sign({ id: existingUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: existingUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    await redis_1.redis.set(`refresh:${existingUser.id}`, refreshToken, { EX: 7 * 24 * 60 * 60 });
    res.cookie('refresh_token', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: true,
    });
    return res.status(200).json({ message: "Login successfull", accessToken });
});
exports.resendVerificationOTP = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const { email } = req.body;
    if (!email)
        throw new errors_1.BadRequest("Email is required");
    const user_data = (0, emailVerification_1.resendOTP)(email);
    if (!user_data)
        throw new errors_1.BadRequest("No pending verification found for this email");
    const html = `
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
  </div>`;
    (0, emailService_1.sendEmails)({ to: email, subject: 'Email Verification', body: html });
    return res.status(200).json({ message: "OTP resent successfully" });
});
exports.getMe = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const userId = req.user?.id;
    if (!userId)
        throw new errors_1.UnauthorizedError("Not authenticated");
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, role: true }
    });
    if (!user)
        throw new errors_1.NotFoundError("User not found");
    return res.status(200).json({ message: "User fetched successfully", user });
});
//# sourceMappingURL=userControllers.js.map