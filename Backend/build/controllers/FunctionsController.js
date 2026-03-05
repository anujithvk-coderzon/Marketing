"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCampaign = exports.createEmail = exports.cancelCampaign = exports.fetchCampaignRecipients = exports.editCampaign = exports.editEmail = exports.deleteEmail = exports.csvEmails = exports.fetchCampaigns = exports.createCampaign = exports.fetchEmailFilters = exports.fetchEmails = exports.fetchTemplates = exports.deleteTemplate = exports.editTemplate = exports.createTemplate = exports.sendEmail = void 0;
const errors_1 = require("../errors/errors");
const csvParser_1 = require("../helper/csvParser");
const emailService_1 = require("../helper/emailService");
const validation_1 = require("../helper/validation");
const prisma_1 = require("../library/prisma");
const asyncWrapper_1 = require("../middlewares/asyncWrapper");
const bullMq_1 = require("../helper/bullMq");
const templateVariables_1 = require("../helper/templateVariables");
exports.sendEmail = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.sendMailValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { body, email, saveAsTemplate, subject, name } = validation.data;
    const emailList = Array.isArray(email) ? email : [email];
    const hasVariables = /\$\{(name|email|phone|district|state)\}/i.test(body + subject);
    if (hasVariables) {
        const recipients = await prisma_1.prisma.email.findMany({
            where: { email: { in: emailList } }
        });
        const recipientMap = new Map(recipients.map(r => [r.email.toLowerCase(), r]));
        for (const addr of emailList) {
            const data = recipientMap.get(addr.toLowerCase()) || { email: addr };
            await (0, emailService_1.sendEmails)({
                to: addr,
                subject: (0, templateVariables_1.replaceVariables)(subject, data),
                body: (0, templateVariables_1.replaceVariables)(body, data)
            });
        }
    }
    else {
        await (0, emailService_1.sendEmails)({ to: emailList, subject, body });
    }
    if (saveAsTemplate) {
        const existingTemplate = await prisma_1.prisma.template.findUnique({ where: { name: name } });
        if (existingTemplate)
            throw new errors_1.BadRequest("Template name already exists");
        await prisma_1.prisma.template.create({
            data: { name: name, subject, body }
        });
    }
    await prisma_1.prisma.email.createMany({
        data: emailList.map(e => ({ email: e })),
        skipDuplicates: true
    });
    return res.status(200).json({ message: "Email sent successfully" });
});
exports.createTemplate = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.templateValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { body, subject, name } = validation.data;
    const existingTemplate = await prisma_1.prisma.template.findUnique({ where: { name: name } });
    if (existingTemplate)
        throw new errors_1.BadRequest("Template name already exists");
    const template = await prisma_1.prisma.template.create({ data: { name: name, subject, body } });
    return res.status(201).json({ message: "Template created successfully", template });
});
exports.editTemplate = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.templateValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { body, subject, name } = validation.data;
    const id = req.params.id;
    if (!id)
        throw new errors_1.BadRequest("Id required");
    const template = await prisma_1.prisma.template.findUnique({ where: { id } });
    if (!template)
        throw new errors_1.NotFoundError("Template not found");
    await prisma_1.prisma.template.update({ where: { id }, data: { name, subject, body } });
    return res.status(200).json({ message: "Template edited successfully" });
});
exports.deleteTemplate = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const id = req.params.id;
    if (!id)
        throw new errors_1.BadRequest("Id required");
    const template = await prisma_1.prisma.template.findUnique({ where: { id } });
    if (!template)
        throw new errors_1.NotFoundError("Template not found");
    await prisma_1.prisma.template.delete({ where: { id } });
    return res.status(200).json({ message: "Template deleted successfully" });
});
exports.fetchTemplates = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.templateQueryValidation.safeParse(req.query);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { page, limit, search, sortBy, sortOrder } = validation.data;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [templates, total] = await Promise.all([
        prisma_1.prisma.template.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma_1.prisma.template.count({ where }),
    ]);
    res.status(200).json({
        message: "Templates fetched successfully",
        templates,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
exports.fetchEmails = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.emailQueryValidation.safeParse(req.query);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { page, limit, search, district, state } = validation.data;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { district: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (district)
        where.district = district;
    if (state)
        where.state = state;
    const [emails, total] = await Promise.all([
        prisma_1.prisma.email.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.email.count({ where }),
    ]);
    res.status(200).json({
        message: "Emails fetched successfully",
        emails,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
exports.fetchEmailFilters = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const [districts, states] = await Promise.all([
        prisma_1.prisma.email.findMany({
            where: { district: { not: null } },
            select: { district: true },
            distinct: ['district'],
            orderBy: { district: 'asc' },
        }),
        prisma_1.prisma.email.findMany({
            where: { state: { not: null } },
            select: { state: true },
            distinct: ['state'],
            orderBy: { state: 'asc' },
        }),
    ]);
    res.status(200).json({
        districts: districts.map(d => d.district),
        states: states.map(s => s.state),
    });
});
exports.createCampaign = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.campaignCreationValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { name } = validation.data;
    const existing = await prisma_1.prisma.campaign.findUnique({ where: { name } });
    if (existing)
        throw new errors_1.BadRequest("Campaign name already exists");
    await prisma_1.prisma.campaign.create({ data: { name, status: 'Draft' } });
    return res.status(201).json({ message: "Campaign created successfully" });
});
exports.fetchCampaigns = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.campaignQueryValidation.safeParse(req.query);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { page, limit, search, status } = validation.data;
    const where = {};
    if (search) {
        where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
        where.status = status;
    }
    const [campaigns, total] = await Promise.all([
        prisma_1.prisma.campaign.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.campaign.count({ where }),
    ]);
    return res.status(200).json({
        message: "Campaigns fetched successfully",
        campaigns,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
exports.csvEmails = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const file = req.file;
    if (!file)
        throw new errors_1.BadRequest("File required");
    const result = await (0, csvParser_1.parseCsv)(file);
    await prisma_1.prisma.email.createMany({ data: result.map((i) => ({
            name: i.name || null,
            email: i.email,
            phone: i.phone || null,
            district: i.district || null,
            state: i.state || null,
        })), skipDuplicates: true });
    return res.status(201).json({ message: "Emails added successfully" });
});
exports.deleteEmail = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const id = req.params.id;
    if (!id)
        throw new errors_1.BadRequest("Id required");
    const findEmail = await prisma_1.prisma.email.findUnique({ where: { id } });
    if (!findEmail)
        throw new errors_1.NotFoundError("Email not found");
    await prisma_1.prisma.email.delete({ where: { id } });
    return res.status(200).json({ message: "Email deleted successfully" });
});
exports.editEmail = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.emailEditValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const id = req.params.id;
    if (!id)
        throw new errors_1.BadRequest("Id required");
    const findEmail = await prisma_1.prisma.email.findUnique({ where: { id } });
    if (!findEmail)
        throw new errors_1.NotFoundError("Email not found");
    const { name, email, phone, district, state } = validation.data;
    await prisma_1.prisma.email.update({ where: { id }, data: {
            name: name ?? null,
            email,
            phone: phone ?? null,
            district: district ?? null,
            state: state ?? null
        } });
    return res.status(200).json({ message: "Email edited successfully" });
});
exports.editCampaign = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const id = req.params.id;
    if (!id)
        throw new errors_1.BadRequest("Id required");
    const validation = validation_1.campaignEditValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { name, templateId, scheduledAt, recipients } = validation.data;
    const campaign = await prisma_1.prisma.campaign.findUnique({ where: { id } });
    if (!campaign)
        throw new errors_1.NotFoundError("Campaign not found");
    await prisma_1.prisma.campaign.update({ where: { id }, data: {
            ...(name && { name }),
            ...(templateId !== undefined && { templateId }),
            ...(scheduledAt && { scheduledAt, status: 'Scheduled' }),
            ...(recipients && recipients.length > 0 && {
                recipients: {
                    deleteMany: {},
                    create: recipients.map((mail) => ({ emailId: mail, status: 'Pending' }))
                }
            })
        } });
    if (scheduledAt) {
        await (0, bullMq_1.scheduleCampaignJob)(id, new Date(scheduledAt));
    }
    return res.status(200).json({ message: "Campaign edited successfully" });
});
exports.fetchCampaignRecipients = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const campaignId = req.query.campaignId;
    const where = campaignId ? { campaignId } : {};
    const recipients = await prisma_1.prisma.campaignRecipient.findMany({
        where,
        select: { status: true, sentAt: true, campaign: { select: { name: true } }, email: { select: { email: true, name: true } } }
    });
    if (recipients.length == 0)
        throw new errors_1.NotFoundError("No recipients found");
    return res.status(200).json({ message: "fetched successfully", recipients });
});
exports.cancelCampaign = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const campaignId = req.params.id;
    const campaign = await prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign)
        throw new errors_1.NotFoundError('Campaign not found');
    if (campaign.status === 'Cancelled')
        throw new errors_1.BadRequest('Campaign is already cancelled');
    if (campaign.status === 'Delivered')
        throw new errors_1.BadRequest('Cannot cancel a delivered campaign');
    await (0, bullMq_1.removeCampaignJob)(campaignId);
    await prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Cancelled' } });
    await prisma_1.prisma.campaignRecipient.updateMany({ where: { campaignId }, data: { status: 'Cancelled' } });
    return res.status(200).json({ message: "Campaign cancelled successfully" });
});
exports.createEmail = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const validation = validation_1.emailEditValidation.safeParse(req.body);
    if (!validation.success)
        throw new errors_1.ValidationError(validation.error);
    const { name, email, phone, district, state } = validation.data;
    const existing = await prisma_1.prisma.email.findUnique({ where: { email } });
    if (existing)
        throw new errors_1.BadRequest("Email already exists");
    await prisma_1.prisma.email.create({ data: { name: name ?? null, email, phone: phone ?? null, district: district ?? null, state: state ?? null } });
    return res.status(201).json({ message: "Email created successfully" });
});
exports.deleteCampaign = (0, asyncWrapper_1.asyncWrapper)(async function (req, res) {
    const campaignId = req.params.id;
    const campaign = await prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign)
        throw new errors_1.NotFoundError('Campaign not found');
    await prisma_1.prisma.campaign.delete({ where: { id: campaignId } });
    return res.status(200).json({ message: 'Campaign deleted successfully.' });
});
//# sourceMappingURL=FunctionsController.js.map