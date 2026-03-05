export declare function generateOTP(email: string, name: string, hashedPassword: string, phone: number): {
    email: string;
    name: string;
    password: string;
    phone: number;
    otp: string;
};
export declare function validateOtp(otp: string): any;
export declare function resendOTP(email: string): {
    email: string;
    name: string;
    password: string;
    phone: number;
    otp: string;
} | null;
//# sourceMappingURL=emailVerification.d.ts.map