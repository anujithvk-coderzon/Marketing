"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignQueryValidation = exports.templateQueryValidation = exports.emailQueryValidation = exports.campaignEditValidation = exports.templateValidation = exports.emailEditValidation = exports.campaignCreationValidation = exports.sendMailValidation = exports.loginValidation = exports.otpValidation = exports.registerValidation = void 0;
var zod_1 = require("zod");
exports.registerValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name required"),
    email: zod_1.z.email("Invalid email address"),
    phone: zod_1.z.string().regex(/^\d{10}$/, "Invalid contact number"),
    password: zod_1.z.string().min(8, "Minimum length should be 8")
        .regex(/[A-Z]/, 'Must contain a uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowarcase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[!@#$%&*^?><]/, "Must contain a special character")
});
exports.otpValidation = zod_1.z.object({
    otp: zod_1.z.string().min(4, "4 digit otp required")
});
exports.loginValidation = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(8, "Minimum length should be 8")
        .regex(/[A-Z]/, 'Must contain a uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowarcase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[!@#$%&*^?><]/, "Must contain a special character")
});
exports.sendMailValidation = zod_1.z.object({
    email: zod_1.z.union([
        zod_1.z.email('Invalid email'),
        zod_1.z.array(zod_1.z.email("Invalid email address")).min(1, "Atleast one email required")
    ]),
    name: zod_1.z.string().min(1, "Template name required").optional(),
    subject: zod_1.z.string().min(1, "Subject required"),
    body: zod_1.z.string().min(1, 'Body required'),
    saveAsTemplate: zod_1.z.boolean().optional().default(false)
}).refine(function (data) { return !data.saveAsTemplate || (data.saveAsTemplate && data.name); }, { message: "Template name required when saving as template", path: ["name"] });
exports.campaignCreationValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Campaign name required")
});
var emptyToUndefined = zod_1.z.preprocess(function (val) { return val === '' ? undefined : val; }, zod_1.z.string().optional());
exports.emailEditValidation = zod_1.z.object({
    name: zod_1.z.preprocess(function (val) { return val === '' ? undefined : val; }, zod_1.z.string().min(1).optional()),
    email: zod_1.z.email("Invalid email address").min(1, "Email required"),
    phone: zod_1.z.preprocess(function (val) { return val === '' ? undefined : val; }, zod_1.z.string().regex(/^\d{10}$/, "Invalid phone number").optional()),
    district: emptyToUndefined,
    state: emptyToUndefined,
});
exports.templateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Template name required"),
    subject: zod_1.z.string().min(1, "Subject required"),
    body: zod_1.z.string().min(1, 'Body required')
});
exports.campaignEditValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Campaign name required").optional(),
    templateId: zod_1.z.string("Invalid template id").optional(),
    scheduledAt: zod_1.z.iso.datetime().optional(),
    recipients: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["Draft", "Scheduled", "Delivered", "Cancelled"]).optional(),
}).refine(function (data) { return !data.scheduledAt || (data.templateId && data.recipients && data.recipients.length > 0); }, { message: "Template and at least one recipient are required to schedule a campaign" });
exports.emailQueryValidation = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional().default(''),
    district: zod_1.z.string().optional().default(''),
    state: zod_1.z.string().optional().default(''),
});
exports.templateQueryValidation = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional().default(''),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.campaignQueryValidation = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional().default(''),
    status: zod_1.z.string().optional().default(''),
});
