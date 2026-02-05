import { BadRequest, ValidationError } from "../errors/errors";
import { sendEmails } from "../helper/emailService";
import { sendMailValidation } from "../helper/validation";
import { prisma } from "../library/prisma";
import { asyncWrapper } from "../middlewares/asyncWrapper";
import { Request,Response } from "express";

export const sendEmail = asyncWrapper(async function (req: Request, res: Response) {
    const validation = sendMailValidation.safeParse(req.body)
    if (!validation.success) throw new ValidationError(validation.error)

    const { body, email, saveAsTemplate, subject, name } = validation.data

    await sendEmails({ to: email, subject, body })

    if (saveAsTemplate) {
        const existingTemplate = await prisma.template.findUnique({ where: { name: name! } })
        if (existingTemplate) throw new BadRequest("Template name already exists")
        await prisma.template.create({
            data: { name: name!, subject, body }
        })
    }

    const emails = Array.isArray(email) ? email : [email]
    await prisma.email.createMany({
        data: emails.map(e => ({ email: e })),
        skipDuplicates: true
    })

    return res.status(200).json({ message: "Email sent successfully" })
})