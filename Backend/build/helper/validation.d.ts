import { z } from "zod";
export declare const registerValidation: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    phone: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const otpValidation: z.ZodObject<{
    otp: z.ZodString;
}, z.core.$strip>;
export declare const loginValidation: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const sendMailValidation: z.ZodObject<{
    email: z.ZodUnion<readonly [z.ZodEmail, z.ZodArray<z.ZodEmail>]>;
    name: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    body: z.ZodString;
    saveAsTemplate: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const campaignCreationValidation: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const emailEditValidation: z.ZodObject<{
    name: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
    email: z.ZodEmail;
    phone: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
    district: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
    state: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const templateValidation: z.ZodObject<{
    name: z.ZodString;
    subject: z.ZodString;
    body: z.ZodString;
}, z.core.$strip>;
export declare const campaignEditValidation: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodISODateTime>;
    recipients: z.ZodOptional<z.ZodArray<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        Draft: "Draft";
        Scheduled: "Scheduled";
        Delivered: "Delivered";
        Cancelled: "Cancelled";
    }>>;
}, z.core.$strip>;
export declare const emailQueryValidation: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    district: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    state: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const templateQueryValidation: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export declare const campaignQueryValidation: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=validation.d.ts.map