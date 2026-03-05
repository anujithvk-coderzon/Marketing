import { z } from "zod";

export const registerValidation=z.object({
    name:z.string().min(1,"Name required"),
    email:z.email("Invalid email address"),
    phone:z.string().regex(/^\d{10}$/,"Invalid contact number"),
    password:z.string().min(8,"Minimum length should be 8")
             .regex(/[A-Z]/,'Must contain a uppercase letter')
             .regex(/[a-z]/,'Must contain a lowarcase letter')
             .regex(/[0-9]/,'Must contain a number')
             .regex(/[!@#$%&*^?><]/,"Must contain a special character")
})
export const otpValidation=z.object({
    otp:z.string().min(4,"4 digit otp required")
})
export const loginValidation=z.object({
    email:z.email(),
    password:z.string().min(8,"Minimum length should be 8")
             .regex(/[A-Z]/,'Must contain a uppercase letter')
             .regex(/[a-z]/,'Must contain a lowarcase letter')
             .regex(/[0-9]/,'Must contain a number')
             .regex(/[!@#$%&*^?><]/,"Must contain a special character")
})

export const sendMailValidation=z.object({
    email:z.union([
        z.email('Invalid email'),
        z.array(z.email("Invalid email address")).min(1,"Atleast one email required")
    ]),
    name:z.string().min(1,"Template name required").optional(),
    subject:z.string().min(1,"Subject required"),
    body:z.string().min(1,'Body required'),
    saveAsTemplate: z.boolean().optional().default(false)
}).refine((data)=>!data.saveAsTemplate || (data.saveAsTemplate && data.name),
{message:"Template name required when saving as template",path:["name"]})

export const campaignCreationValidation=z.object({
    name:z.string().min(1,"Campaign name required")
})
const emptyToUndefined = z.preprocess((val) => val === '' ? undefined : val, z.string().optional())

export const emailEditValidation=z.object({
    name:z.preprocess((val) => val === '' ? undefined : val, z.string().min(1).optional()),
    email:z.email("Invalid email address").min(1,"Email required"),
    phone:z.preprocess((val) => val === '' ? undefined : val, z.string().regex(/^\d{10}$/,"Invalid phone number").optional()),
    district:emptyToUndefined,
    state:emptyToUndefined,
})
export const templateValidation=z.object({
    name:z.string().min(1,"Template name required"),
    subject:z.string().min(1,"Subject required"),
    body:z.string().min(1,'Body required')
})

export const campaignEditValidation=z.object({
    name:z.string().min(1,"Campaign name required").optional(),
    templateId:z.string("Invalid template id").optional(),
    scheduledAt:z.iso.datetime().optional(),
    recipients:z.array(z.string()).optional(),
    status:z.enum(["Draft","Scheduled","Delivered","Cancelled"]).optional(),
}).refine(
    (data) => !data.scheduledAt || (data.templateId && data.recipients && data.recipients.length > 0),
    { message: "Template and at least one recipient are required to schedule a campaign" }
)

export const emailQueryValidation = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional().default(''),
    district: z.string().optional().default(''),
    state: z.string().optional().default(''),
})

export const templateQueryValidation = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional().default(''),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const campaignQueryValidation = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional().default(''),
    status: z.string().optional().default(''),
})