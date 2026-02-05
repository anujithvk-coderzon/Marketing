import { z } from "zod";

export const registerValidation=z.object({
    name:z.string().min(1,"Name required"),
    email:z.email("Invalid email address"),
    password:z.string().min(8,"Minimum length should be 8")
             .regex(/[A-Z]/,'Must contain a uppercase letter')
             .regex(/[a-z]/,'Must contain a lowarcase letter')
             .regex(/[0-9]/,'Must contain a number')
             .regex(/[!@#$%&*^?><]/,"Must contain a special character")
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
