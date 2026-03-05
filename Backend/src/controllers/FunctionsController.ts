import { JwtPayload } from "jsonwebtoken";
import { BadRequest, NotFoundError, ValidationError } from "../errors/errors";
import { parseCsv } from "../helper/csvParser";
import { sendEmails } from "../helper/emailService";
import { campaignCreationValidation, campaignEditValidation, campaignQueryValidation, emailEditValidation, emailQueryValidation, sendMailValidation, templateQueryValidation, templateValidation } from "../helper/validation";
import { prisma } from "../library/prisma";
import { asyncWrapper } from "../middlewares/asyncWrapper";
import { Request,Response } from "express";
import { removeCampaignJob, scheduleCampaignJob } from "../helper/bullMq";
import { replaceVariables } from "../helper/templateVariables";

export const sendEmail = asyncWrapper(async function (req: Request, res: Response) {
    const validation = sendMailValidation.safeParse(req.body)
    if (!validation.success) throw new ValidationError(validation.error)
    const { body, email, saveAsTemplate, subject, name } = validation.data
    const emailList = Array.isArray(email) ? email : [email]
    const hasVariables = /\$\{(name|email|phone|district|state)\}/i.test(body + subject)
    if (hasVariables) {
        const recipients = await prisma.email.findMany({
            where: { email: { in: emailList } }
        })
        const recipientMap = new Map(recipients.map(r => [r.email.toLowerCase(), r]))
        for (const addr of emailList) {
            const data = recipientMap.get(addr.toLowerCase()) || { email: addr }
            await sendEmails({
                to: addr,
                subject: replaceVariables(subject, data),
                body: replaceVariables(body, data)
            })
        }
    } else {
        await sendEmails({ to: emailList, subject, body })
    }
    if (saveAsTemplate) {
        const existingTemplate = await prisma.template.findUnique({ where: { name: name! } })
        if (existingTemplate) throw new BadRequest("Template name already exists")
        await prisma.template.create({
            data: { name: name!, subject, body }
        })
    }
    await prisma.email.createMany({
        data: emailList.map(e => ({ email: e })),
        skipDuplicates: true
    })
    return res.status(200).json({ message: "Email sent successfully" })
})
export const createTemplate=asyncWrapper(async function (req:Request,res:Response) {
    const validation=templateValidation.safeParse(req.body);
    if(!validation.success) throw new ValidationError(validation.error)
    const {body,subject,name}=validation.data;
    const existingTemplate=await prisma.template.findUnique({where:{name:name!}})
    if(existingTemplate) throw new BadRequest("Template name already exists")
    const template=await prisma.template.create({data:{name:name!,subject,body}})
    return res.status(201).json({message:"Template created successfully",template})
})
export const editTemplate=asyncWrapper(async function (req:Request,res:Response) {
    const validation=templateValidation.safeParse(req.body);
    if(!validation.success) throw new ValidationError(validation.error)
    const {body,subject,name}=validation.data;
    const id=req.params.id as string;
    if(!id) throw new BadRequest("Id required")
    const template=await prisma.template.findUnique({where:{id}})
    if(!template) throw new NotFoundError("Template not found")
    await prisma.template.update({where:{id},data:{name,subject,body}})
    return res.status(200).json({message:"Template edited successfully"})
})
export const deleteTemplate=asyncWrapper(async function (req:Request,res:Response) {
    const id=req.params.id as string
    if(!id) throw new BadRequest("Id required")
    const template=await prisma.template.findUnique({where:{id}})
    if(!template) throw new NotFoundError("Template not found")
    await prisma.template.delete({where:{id}})
    return res.status(200).json({message:"Template deleted successfully"})
})
export const fetchTemplates=asyncWrapper(async function (req:Request,res:Response) {
    const validation = templateQueryValidation.safeParse(req.query)
    if (!validation.success) throw new ValidationError(validation.error)
    const { page, limit, search, sortBy, sortOrder } = validation.data

    const where: any = {}
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
        ]
    }

    const [templates, total] = await Promise.all([
        prisma.template.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.template.count({ where }),
    ])

    res.status(200).json({
        message: "Templates fetched successfully",
        templates,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
})
export const fetchEmails=asyncWrapper(async function (req:Request,res:Response) {
    const validation = emailQueryValidation.safeParse(req.query)
    if (!validation.success) throw new ValidationError(validation.error)
    const { page, limit, search, district, state } = validation.data

    const where: any = {}
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { district: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } },
        ]
    }
    if (district) where.district = district
    if (state) where.state = state

    const [emails, total] = await Promise.all([
        prisma.email.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.email.count({ where }),
    ])

    res.status(200).json({
        message: "Emails fetched successfully",
        emails,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
})

export const fetchEmailFilters=asyncWrapper(async function (req:Request,res:Response) {
    const [districts, states] = await Promise.all([
        prisma.email.findMany({
            where: { district: { not: null } },
            select: { district: true },
            distinct: ['district'],
            orderBy: { district: 'asc' },
        }),
        prisma.email.findMany({
            where: { state: { not: null } },
            select: { state: true },
            distinct: ['state'],
            orderBy: { state: 'asc' },
        }),
    ])
    res.status(200).json({
        districts: districts.map(d => d.district),
        states: states.map(s => s.state),
    })
})

export const createCampaign=asyncWrapper(async function (req:Request,res:Response) {
    const validation=campaignCreationValidation.safeParse(req.body)
    if(!validation.success) throw new ValidationError(validation.error)
    const {name}=validation.data;
    const existing=await prisma.campaign.findUnique({where:{name}})
    if(existing) throw new BadRequest("Campaign name already exists")
    await prisma.campaign.create({data:{name,status:'Draft'}})
    return res.status(201).json({message:"Campaign created successfully"})
})
export const fetchCampaigns=asyncWrapper(async function (req:Request,res:Response) {
    const validation = campaignQueryValidation.safeParse(req.query)
    if (!validation.success) throw new ValidationError(validation.error)
    const { page, limit, search, status } = validation.data

    const where: any = {}
    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }
    if (status) {
        where.status = status
    }

    const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.campaign.count({ where }),
    ])

    return res.status(200).json({
        message: "Campaigns fetched successfully",
        campaigns,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
})
export const csvEmails=asyncWrapper(async function (req:Request,res:Response) {
    const file=req.file
    if(!file) throw new BadRequest("File required")
    const result=await parseCsv(file)
    await prisma.email.createMany({data:result.map((i)=>({
    name:i.name || null,
    email:i.email,
    phone:i.phone || null,
    district:i.district || null,
    state:i.state || null,
   })),skipDuplicates:true}) 
   return res.status(201).json({message:"Emails added successfully"})
})

export const deleteEmail=asyncWrapper(async function (req:Request,res:Response) {
    const id=req.params.id as string
    if(!id) throw new BadRequest("Id required")
    const findEmail=await prisma.email.findUnique({where:{id}})
    if(!findEmail) throw new NotFoundError("Email not found")
    await prisma.email.delete({where:{id}})
    return res.status(200).json({message:"Email deleted successfully"})
})
export const editEmail=asyncWrapper(async function (req:Request,res:Response) {
    const validation=emailEditValidation.safeParse(req.body)
    if(!validation.success) throw new ValidationError(validation.error)
      const id=req.params.id as string
    if(!id) throw new BadRequest("Id required")
    const findEmail=await prisma.email.findUnique({where:{id}})
    if(!findEmail) throw new NotFoundError("Email not found")
    const {name,email,phone,district,state}=validation.data
    await prisma.email.update({where:{id},data:{
     name: name ?? null,
     email,
     phone: phone ?? null,
     district: district ?? null,
     state: state ?? null}})
    return res.status(200).json({message:"Email edited successfully"})
   })

export const editCampaign=asyncWrapper(async function (req:Request,res:Response) {
    const id = req.params.id as string;
    if(!id) throw new BadRequest("Id required")
    const validation=campaignEditValidation.safeParse(req.body)
    if(!validation.success) throw new ValidationError(validation.error)
    const {name,templateId,scheduledAt,recipients}=validation.data;
    const campaign=await prisma.campaign.findUnique({where:{id}})
    if(!campaign) throw new NotFoundError("Campaign not found")
    await prisma.campaign.update({where:{id},data:{
        ...(name && {name}),
        ...(templateId !== undefined && {templateId}),
        ...(scheduledAt && {scheduledAt,status:'Scheduled'}),
        ...(recipients && recipients.length > 0 && {
            recipients:{
                deleteMany:{},
                create:recipients.map((mail)=>({emailId:mail,status:'Pending'}))
            }
        })
    }})
    if(scheduledAt){
        await scheduleCampaignJob(id,new Date(scheduledAt))
    }
    return res.status(200).json({message:"Campaign edited successfully"})
})

export const fetchCampaignRecipients=asyncWrapper(async function(req:Request,res:Response) {
    const campaignId=req.query.campaignId as string | undefined
    const where=campaignId ? {campaignId} : {}
    const recipients=await prisma.campaignRecipient.findMany({
        where,
        select:{status:true,sentAt:true,campaign:{select:{name:true}},email:{select:{email:true,name:true}}}
    })
    if(recipients.length==0) throw new NotFoundError("No recipients found")
    return res.status(200).json({message:"fetched successfully",recipients})
})

export const cancelCampaign=asyncWrapper(async function (req:Request,res:Response) {
    const campaignId=req.params.id as string
    const campaign=await prisma.campaign.findUnique({where:{id:campaignId}})
    if(!campaign) throw new NotFoundError('Campaign not found')
    if(campaign.status==='Cancelled') throw new BadRequest('Campaign is already cancelled')
    if(campaign.status==='Delivered') throw new BadRequest('Cannot cancel a delivered campaign')
    await removeCampaignJob(campaignId)
    await prisma.campaign.update({where:{id:campaignId},data:{status:'Cancelled'}})
    await prisma.campaignRecipient.updateMany({where:{campaignId},data:{status:'Cancelled'}})
    return res.status(200).json({message:"Campaign cancelled successfully"})
})

export const createEmail=asyncWrapper(async function (req:Request,res:Response) {
    const validation=emailEditValidation.safeParse(req.body)
    if(!validation.success) throw new ValidationError(validation.error)
    const {name,email,phone,district,state}=validation.data
    const existing=await prisma.email.findUnique({where:{email}})
    if(existing) throw new BadRequest("Email already exists")
    await prisma.email.create({data:{name: name ?? null,email,phone: phone ?? null,district: district ?? null,state: state ?? null}})
    return res.status(201).json({message:"Email created successfully"})
})

export const deleteCampaign=asyncWrapper(async function (req:Request,res:Response) {
    const campaignId=req.params.id as string;
    const campaign=await prisma.campaign.findUnique({where:{id:campaignId}})
    if(!campaign) throw new NotFoundError('Campaign not found')
    await prisma.campaign.delete({where:{id:campaignId}})
    return res.status(200).json({message:'Campaign deleted successfully.'})
})