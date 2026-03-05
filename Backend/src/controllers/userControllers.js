"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resendVerificationOTP = exports.loginUser = exports.verifyEmailOTP = exports.registerUser = void 0;
var validation_1 = require("./../helper/validation");
var asyncWrapper_1 = require("../middlewares/asyncWrapper");
var errors_1 = require("../errors/errors");
var prisma_1 = require("../library/prisma");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var redis_1 = require("../helper/redis");
var emailVerification_1 = require("../helper/emailVerification");
var emailService_1 = require("../helper/emailService");
var USER_ERRORS = {
    alreadyExist: "User already exist with this email address",
    invalidData: "Invalid email or password"
};
exports.registerUser = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validate, _a, email, name, password, phone, existingUser, hashedPassword, corrected_number, user_data, html;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validate = validation_1.registerValidation.safeParse(req.body);
                    if (!validate.success)
                        throw new errors_1.ValidationError(validate.error);
                    _a = validate.data, email = _a.email, name = _a.name, password = _a.password, phone = _a.phone;
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({ where: { email: email } })];
                case 1:
                    existingUser = _b.sent();
                    if (existingUser)
                        throw new errors_1.ConflictError(USER_ERRORS.alreadyExist);
                    return [4 /*yield*/, (0, bcrypt_1.hash)(password, 10)];
                case 2:
                    hashedPassword = _b.sent();
                    corrected_number = Number(phone);
                    user_data = (0, emailVerification_1.generateOTP)(email, name, hashedPassword, corrected_number);
                    html = "\n  <div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;\">\n    <div style=\"background:linear-gradient(135deg,#3b82f6,#2563eb);padding:32px 24px;text-align:center;\">\n      <h1 style=\"margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;\">CODERZON</h1>\n      <p style=\"margin:4px 0 0;color:#bfdbfe;font-size:11px;\">Marketing Management System</p>\n    </div>\n    <div style=\"padding:32px 24px;text-align:center;\">\n      <p style=\"margin:0 0 8px;color:#475569;font-size:15px;\">Hi <strong style=\"color:#1e293b;\">".concat(user_data.name, "</strong>,</p>\n      <p style=\"margin:0 0 24px;color:#64748b;font-size:14px;\">Use the code below to verify your email address.</p>\n      <div style=\"background:#f1f5f9;border-radius:12px;padding:20px;display:inline-block;min-width:200px;\">\n        <span style=\"font-size:36px;font-weight:800;letter-spacing:10px;color:#1e293b;\">").concat(user_data.otp, "</span>\n      </div>\n      <p style=\"margin:24px 0 0;color:#94a3b8;font-size:12px;\">This code expires in <strong style=\"color:#64748b;\">10 minutes</strong>.</p>\n      <p style=\"margin:6px 0 0;color:#94a3b8;font-size:12px;\">If you didn't request this, you can safely ignore this email.</p>\n    </div>\n    <div style=\"background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;\">\n      <p style=\"margin:0;color:#94a3b8;font-size:11px;\">&copy; ").concat(new Date().getFullYear(), " CODERZON. All rights reserved.</p>\n    </div>\n  </div>");
                    (0, emailService_1.sendEmails)({ to: email, subject: 'Email Verification', body: html });
                    return [2 /*return*/, res.status(200).json({ message: "Verification OTP send successfully" })];
            }
        });
    });
});
exports.verifyEmailOTP = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, otp, user_data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validation = validation_1.otpValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    otp = validation.data.otp;
                    user_data = (0, emailVerification_1.validateOtp)(otp);
                    if (!user_data)
                        throw new errors_1.BadRequest("Invalid or expired OTP");
                    return [4 /*yield*/, prisma_1.prisma.user.create({ data: {
                                name: user_data.name,
                                email: user_data.email,
                                password: user_data.password,
                                phone: user_data.phone
                            } })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ message: "User registered successfully" })];
            }
        });
    });
});
exports.loginUser = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, email, password, existingUser, passwordValidate, accessToken, refreshToken;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = validation_1.loginValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, email = _a.email, password = _a.password;
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({ where: { email: email } })];
                case 1:
                    existingUser = _b.sent();
                    if (!existingUser)
                        throw new errors_1.BadRequest(USER_ERRORS.invalidData);
                    return [4 /*yield*/, (0, bcrypt_1.compare)(password, existingUser.password)];
                case 2:
                    passwordValidate = _b.sent();
                    if (!passwordValidate)
                        throw new errors_1.BadRequest(USER_ERRORS.invalidData);
                    accessToken = jsonwebtoken_1.default.sign({ id: existingUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                    refreshToken = jsonwebtoken_1.default.sign({ id: existingUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                    return [4 /*yield*/, redis_1.redis.set("refresh:".concat(existingUser.id), refreshToken, { EX: 7 * 24 * 60 * 60 })];
                case 3:
                    _b.sent();
                    res.cookie('refresh_token', refreshToken, {
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: true,
                    });
                    return [2 /*return*/, res.status(200).json({ message: "Login successfull", accessToken: accessToken })];
            }
        });
    });
});
exports.resendVerificationOTP = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var email, user_data, html;
        return __generator(this, function (_a) {
            email = req.body.email;
            if (!email)
                throw new errors_1.BadRequest("Email is required");
            user_data = (0, emailVerification_1.resendOTP)(email);
            if (!user_data)
                throw new errors_1.BadRequest("No pending verification found for this email");
            html = "\n  <div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;\">\n    <div style=\"background:linear-gradient(135deg,#3b82f6,#2563eb);padding:32px 24px;text-align:center;\">\n      <h1 style=\"margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;\">CODERZON</h1>\n      <p style=\"margin:4px 0 0;color:#bfdbfe;font-size:11px;\">Marketing Management System</p>\n    </div>\n    <div style=\"padding:32px 24px;text-align:center;\">\n      <p style=\"margin:0 0 8px;color:#475569;font-size:15px;\">Hi <strong style=\"color:#1e293b;\">".concat(user_data.name, "</strong>,</p>\n      <p style=\"margin:0 0 24px;color:#64748b;font-size:14px;\">Here is your new verification code.</p>\n      <div style=\"background:#f1f5f9;border-radius:12px;padding:20px;display:inline-block;min-width:200px;\">\n        <span style=\"font-size:36px;font-weight:800;letter-spacing:10px;color:#1e293b;\">").concat(user_data.otp, "</span>\n      </div>\n      <p style=\"margin:24px 0 0;color:#94a3b8;font-size:12px;\">This code expires in <strong style=\"color:#64748b;\">10 minutes</strong>.</p>\n      <p style=\"margin:6px 0 0;color:#94a3b8;font-size:12px;\">If you didn't request this, you can safely ignore this email.</p>\n    </div>\n    <div style=\"background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;\">\n      <p style=\"margin:0;color:#94a3b8;font-size:11px;\">&copy; ").concat(new Date().getFullYear(), " CODERZON. All rights reserved.</p>\n    </div>\n  </div>");
            (0, emailService_1.sendEmails)({ to: email, subject: 'Email Verification', body: html });
            return [2 /*return*/, res.status(200).json({ message: "OTP resent successfully" })];
        });
    });
});
exports.getMe = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, user;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId)
                        throw new errors_1.UnauthorizedError("Not authenticated");
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: { id: userId },
                            select: { name: true, email: true, role: true }
                        })];
                case 1:
                    user = _b.sent();
                    if (!user)
                        throw new errors_1.NotFoundError("User not found");
                    return [2 /*return*/, res.status(200).json({ message: "User fetched successfully", user: user })];
            }
        });
    });
});
