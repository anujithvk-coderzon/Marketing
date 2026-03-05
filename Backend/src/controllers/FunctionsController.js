"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.deleteCampaign = exports.createEmail = exports.cancelCampaign = exports.fetchCampaignRecipients = exports.editCampaign = exports.editEmail = exports.deleteEmail = exports.csvEmails = exports.fetchCampaigns = exports.createCampaign = exports.fetchEmailFilters = exports.fetchEmails = exports.fetchTemplates = exports.deleteTemplate = exports.editTemplate = exports.createTemplate = exports.sendEmail = void 0;
var errors_1 = require("../errors/errors");
var csvParser_1 = require("../helper/csvParser");
var emailService_1 = require("../helper/emailService");
var validation_1 = require("../helper/validation");
var prisma_1 = require("../library/prisma");
var asyncWrapper_1 = require("../middlewares/asyncWrapper");
var bullMq_1 = require("../helper/bullMq");
var templateVariables_1 = require("../helper/templateVariables");
exports.sendEmail = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, body, email, saveAsTemplate, subject, name, emailList, hasVariables, recipients, recipientMap, _i, emailList_1, addr, data, existingTemplate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = validation_1.sendMailValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, body = _a.body, email = _a.email, saveAsTemplate = _a.saveAsTemplate, subject = _a.subject, name = _a.name;
                    emailList = Array.isArray(email) ? email : [email];
                    hasVariables = /\$\{(name|email|phone|district|state)\}/i.test(body + subject);
                    if (!hasVariables) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma_1.prisma.email.findMany({
                            where: { email: { in: emailList } }
                        })];
                case 1:
                    recipients = _b.sent();
                    recipientMap = new Map(recipients.map(function (r) { return [r.email.toLowerCase(), r]; }));
                    _i = 0, emailList_1 = emailList;
                    _b.label = 2;
                case 2:
                    if (!(_i < emailList_1.length)) return [3 /*break*/, 5];
                    addr = emailList_1[_i];
                    data = recipientMap.get(addr.toLowerCase()) || { email: addr };
                    return [4 /*yield*/, (0, emailService_1.sendEmails)({
                            to: addr,
                            subject: (0, templateVariables_1.replaceVariables)(subject, data),
                            body: (0, templateVariables_1.replaceVariables)(body, data)
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, (0, emailService_1.sendEmails)({ to: emailList, subject: subject, body: body })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    if (!saveAsTemplate) return [3 /*break*/, 11];
                    return [4 /*yield*/, prisma_1.prisma.template.findUnique({ where: { name: name } })];
                case 9:
                    existingTemplate = _b.sent();
                    if (existingTemplate)
                        throw new errors_1.BadRequest("Template name already exists");
                    return [4 /*yield*/, prisma_1.prisma.template.create({
                            data: { name: name, subject: subject, body: body }
                        })];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [4 /*yield*/, prisma_1.prisma.email.createMany({
                        data: emailList.map(function (e) { return ({ email: e }); }),
                        skipDuplicates: true
                    })];
                case 12:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Email sent successfully" })];
            }
        });
    });
});
exports.createTemplate = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, body, subject, name, existingTemplate, template;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = validation_1.templateValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, body = _a.body, subject = _a.subject, name = _a.name;
                    return [4 /*yield*/, prisma_1.prisma.template.findUnique({ where: { name: name } })];
                case 1:
                    existingTemplate = _b.sent();
                    if (existingTemplate)
                        throw new errors_1.BadRequest("Template name already exists");
                    return [4 /*yield*/, prisma_1.prisma.template.create({ data: { name: name, subject: subject, body: body } })];
                case 2:
                    template = _b.sent();
                    return [2 /*return*/, res.status(201).json({ message: "Template created successfully", template: template })];
            }
        });
    });
});
exports.editTemplate = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, body, subject, name, id, template;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = validation_1.templateValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, body = _a.body, subject = _a.subject, name = _a.name;
                    id = req.params.id;
                    if (!id)
                        throw new errors_1.BadRequest("Id required");
                    return [4 /*yield*/, prisma_1.prisma.template.findUnique({ where: { id: id } })];
                case 1:
                    template = _b.sent();
                    if (!template)
                        throw new errors_1.NotFoundError("Template not found");
                    return [4 /*yield*/, prisma_1.prisma.template.update({ where: { id: id }, data: { name: name, subject: subject, body: body } })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Template edited successfully" })];
            }
        });
    });
});
exports.deleteTemplate = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, template;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    if (!id)
                        throw new errors_1.BadRequest("Id required");
                    return [4 /*yield*/, prisma_1.prisma.template.findUnique({ where: { id: id } })];
                case 1:
                    template = _a.sent();
                    if (!template)
                        throw new errors_1.NotFoundError("Template not found");
                    return [4 /*yield*/, prisma_1.prisma.template.delete({ where: { id: id } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Template deleted successfully" })];
            }
        });
    });
});
exports.fetchTemplates = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, page, limit, search, sortBy, sortOrder, where, _b, templates, total;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    validation = validation_1.templateQueryValidation.safeParse(req.query);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, page = _a.page, limit = _a.limit, search = _a.search, sortBy = _a.sortBy, sortOrder = _a.sortOrder;
                    where = {};
                    if (search) {
                        where.OR = [
                            { name: { contains: search, mode: 'insensitive' } },
                            { subject: { contains: search, mode: 'insensitive' } },
                        ];
                    }
                    return [4 /*yield*/, Promise.all([
                            prisma_1.prisma.template.findMany({
                                where: where,
                                skip: (page - 1) * limit,
                                take: limit,
                                orderBy: (_c = {}, _c[sortBy] = sortOrder, _c),
                            }),
                            prisma_1.prisma.template.count({ where: where }),
                        ])];
                case 1:
                    _b = _d.sent(), templates = _b[0], total = _b[1];
                    res.status(200).json({
                        message: "Templates fetched successfully",
                        templates: templates,
                        pagination: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
exports.fetchEmails = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, page, limit, search, district, state, where, _b, emails, total;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    validation = validation_1.emailQueryValidation.safeParse(req.query);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, page = _a.page, limit = _a.limit, search = _a.search, district = _a.district, state = _a.state;
                    where = {};
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
                    return [4 /*yield*/, Promise.all([
                            prisma_1.prisma.email.findMany({
                                where: where,
                                skip: (page - 1) * limit,
                                take: limit,
                                orderBy: { createdAt: 'desc' },
                            }),
                            prisma_1.prisma.email.count({ where: where }),
                        ])];
                case 1:
                    _b = _c.sent(), emails = _b[0], total = _b[1];
                    res.status(200).json({
                        message: "Emails fetched successfully",
                        emails: emails,
                        pagination: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) },
                    });
                    return [2 /*return*/];
            }
        });
    });
});
exports.fetchEmailFilters = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, districts, states;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
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
                    ])];
                case 1:
                    _a = _b.sent(), districts = _a[0], states = _a[1];
                    res.status(200).json({
                        districts: districts.map(function (d) { return d.district; }),
                        states: states.map(function (s) { return s.state; }),
                    });
                    return [2 /*return*/];
            }
        });
    });
});
exports.createCampaign = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, name, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validation = validation_1.campaignCreationValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    name = validation.data.name;
                    return [4 /*yield*/, prisma_1.prisma.campaign.findUnique({ where: { name: name } })];
                case 1:
                    existing = _a.sent();
                    if (existing)
                        throw new errors_1.BadRequest("Campaign name already exists");
                    return [4 /*yield*/, prisma_1.prisma.campaign.create({ data: { name: name, status: 'Draft' } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res.status(201).json({ message: "Campaign created successfully" })];
            }
        });
    });
});
exports.fetchCampaigns = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, page, limit, search, status, where, _b, campaigns, total;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    validation = validation_1.campaignQueryValidation.safeParse(req.query);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, page = _a.page, limit = _a.limit, search = _a.search, status = _a.status;
                    where = {};
                    if (search) {
                        where.name = { contains: search, mode: 'insensitive' };
                    }
                    if (status) {
                        where.status = status;
                    }
                    return [4 /*yield*/, Promise.all([
                            prisma_1.prisma.campaign.findMany({
                                where: where,
                                skip: (page - 1) * limit,
                                take: limit,
                                orderBy: { createdAt: 'desc' },
                            }),
                            prisma_1.prisma.campaign.count({ where: where }),
                        ])];
                case 1:
                    _b = _c.sent(), campaigns = _b[0], total = _b[1];
                    return [2 /*return*/, res.status(200).json({
                            message: "Campaigns fetched successfully",
                            campaigns: campaigns,
                            pagination: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) },
                        })];
            }
        });
    });
});
exports.csvEmails = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var file, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = req.file;
                    if (!file)
                        throw new errors_1.BadRequest("File required");
                    return [4 /*yield*/, (0, csvParser_1.parseCsv)(file)];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.email.createMany({ data: result.map(function (i) { return ({
                                name: i.name || null,
                                email: i.email,
                                phone: i.phone || null,
                                district: i.district || null,
                                state: i.state || null,
                            }); }), skipDuplicates: true })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res.status(201).json({ message: "Emails added successfully" })];
            }
        });
    });
});
exports.deleteEmail = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, findEmail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    if (!id)
                        throw new errors_1.BadRequest("Id required");
                    return [4 /*yield*/, prisma_1.prisma.email.findUnique({ where: { id: id } })];
                case 1:
                    findEmail = _a.sent();
                    if (!findEmail)
                        throw new errors_1.NotFoundError("Email not found");
                    return [4 /*yield*/, prisma_1.prisma.email.delete({ where: { id: id } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Email deleted successfully" })];
            }
        });
    });
});
exports.editEmail = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, id, findEmail, _a, name, email, phone, district, state;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = validation_1.emailEditValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    id = req.params.id;
                    if (!id)
                        throw new errors_1.BadRequest("Id required");
                    return [4 /*yield*/, prisma_1.prisma.email.findUnique({ where: { id: id } })];
                case 1:
                    findEmail = _b.sent();
                    if (!findEmail)
                        throw new errors_1.NotFoundError("Email not found");
                    _a = validation.data, name = _a.name, email = _a.email, phone = _a.phone, district = _a.district, state = _a.state;
                    return [4 /*yield*/, prisma_1.prisma.email.update({ where: { id: id }, data: {
                                name: name !== null && name !== void 0 ? name : null,
                                email: email,
                                phone: phone !== null && phone !== void 0 ? phone : null,
                                district: district !== null && district !== void 0 ? district : null,
                                state: state !== null && state !== void 0 ? state : null
                            } })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Email edited successfully" })];
            }
        });
    });
});
exports.editCampaign = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, validation, _a, name, templateId, scheduledAt, recipients, campaign;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    id = req.params.id;
                    if (!id)
                        throw new errors_1.BadRequest("Id required");
                    validation = validation_1.campaignEditValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, name = _a.name, templateId = _a.templateId, scheduledAt = _a.scheduledAt, recipients = _a.recipients;
                    return [4 /*yield*/, prisma_1.prisma.campaign.findUnique({ where: { id: id } })];
                case 1:
                    campaign = _b.sent();
                    if (!campaign)
                        throw new errors_1.NotFoundError("Campaign not found");
                    return [4 /*yield*/, prisma_1.prisma.campaign.update({ where: { id: id }, data: __assign(__assign(__assign(__assign({}, (name && { name: name })), (templateId !== undefined && { templateId: templateId })), (scheduledAt && { scheduledAt: scheduledAt, status: 'Scheduled' })), (recipients && recipients.length > 0 && {
                                recipients: {
                                    deleteMany: {},
                                    create: recipients.map(function (mail) { return ({ emailId: mail, status: 'Pending' }); })
                                }
                            })) })];
                case 2:
                    _b.sent();
                    if (!scheduledAt) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, bullMq_1.scheduleCampaignJob)(id, new Date(scheduledAt))];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, res.status(200).json({ message: "Campaign edited successfully" })];
            }
        });
    });
});
exports.fetchCampaignRecipients = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var campaignId, where, recipients;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    campaignId = req.query.campaignId;
                    where = campaignId ? { campaignId: campaignId } : {};
                    return [4 /*yield*/, prisma_1.prisma.campaignRecipient.findMany({
                            where: where,
                            select: { status: true, sentAt: true, campaign: { select: { name: true } }, email: { select: { email: true, name: true } } }
                        })];
                case 1:
                    recipients = _a.sent();
                    if (recipients.length == 0)
                        throw new errors_1.NotFoundError("No recipients found");
                    return [2 /*return*/, res.status(200).json({ message: "fetched successfully", recipients: recipients })];
            }
        });
    });
});
exports.cancelCampaign = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var campaignId, campaign;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    campaignId = req.params.id;
                    return [4 /*yield*/, prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } })];
                case 1:
                    campaign = _a.sent();
                    if (!campaign)
                        throw new errors_1.NotFoundError('Campaign not found');
                    if (campaign.status === 'Cancelled')
                        throw new errors_1.BadRequest('Campaign is already cancelled');
                    if (campaign.status === 'Delivered')
                        throw new errors_1.BadRequest('Cannot cancel a delivered campaign');
                    return [4 /*yield*/, (0, bullMq_1.removeCampaignJob)(campaignId)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Cancelled' } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.campaignRecipient.updateMany({ where: { campaignId: campaignId }, data: { status: 'Cancelled' } })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Campaign cancelled successfully" })];
            }
        });
    });
});
exports.createEmail = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, name, email, phone, district, state, existing;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = validation_1.emailEditValidation.safeParse(req.body);
                    if (!validation.success)
                        throw new errors_1.ValidationError(validation.error);
                    _a = validation.data, name = _a.name, email = _a.email, phone = _a.phone, district = _a.district, state = _a.state;
                    return [4 /*yield*/, prisma_1.prisma.email.findUnique({ where: { email: email } })];
                case 1:
                    existing = _b.sent();
                    if (existing)
                        throw new errors_1.BadRequest("Email already exists");
                    return [4 /*yield*/, prisma_1.prisma.email.create({ data: { name: name !== null && name !== void 0 ? name : null, email: email, phone: phone !== null && phone !== void 0 ? phone : null, district: district !== null && district !== void 0 ? district : null, state: state !== null && state !== void 0 ? state : null } })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.status(201).json({ message: "Email created successfully" })];
            }
        });
    });
});
exports.deleteCampaign = (0, asyncWrapper_1.asyncWrapper)(function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var campaignId, campaign;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    campaignId = req.params.id;
                    return [4 /*yield*/, prisma_1.prisma.campaign.findUnique({ where: { id: campaignId } })];
                case 1:
                    campaign = _a.sent();
                    if (!campaign)
                        throw new errors_1.NotFoundError('Campaign not found');
                    return [4 /*yield*/, prisma_1.prisma.campaign.delete({ where: { id: campaignId } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({ message: 'Campaign deleted successfully.' })];
            }
        });
    });
});
