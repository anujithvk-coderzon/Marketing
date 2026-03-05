"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.validateOtp = validateOtp;
exports.resendOTP = resendOTP;
var verificationOTP = new Map();
var emailToOtp = new Map();
function generateOTP(email, name, hashedPassword, phone) {
    // Remove old OTP if exists for this email
    var oldOtp = emailToOtp.get(email);
    if (oldOtp)
        verificationOTP.delete(oldOtp);
    var otp = Math.floor(1000 + Math.random() * 9000).toString();
    var user_data = {
        email: email,
        name: name,
        password: hashedPassword,
        phone: phone,
        otp: otp
    };
    verificationOTP.set(otp, user_data);
    emailToOtp.set(email, otp);
    setTimeout(function () {
        verificationOTP.delete(otp);
        emailToOtp.delete(email);
    }, 10 * 60 * 1000);
    return user_data;
}
function validateOtp(otp) {
    return verificationOTP.get(otp);
}
function resendOTP(email) {
    var oldOtp = emailToOtp.get(email);
    if (!oldOtp)
        return null;
    var oldData = verificationOTP.get(oldOtp);
    if (!oldData)
        return null;
    // Delete old OTP
    verificationOTP.delete(oldOtp);
    emailToOtp.delete(email);
    // Generate new OTP with same user data
    return generateOTP(oldData.email, oldData.name, oldData.password, oldData.phone);
}
