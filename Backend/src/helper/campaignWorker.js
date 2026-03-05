"use strict";
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
var bullmq_1 = require("bullmq");
var prisma_1 = require("../library/prisma");
var emailService_1 = require("./emailService");
var bullMq_1 = require("./bullMq");
var templateVariables_1 = require("./templateVariables");
var worker = new bullmq_1.Worker('campaign-email', function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var campaignId, campaign, _i, _a, recipient, personalizedBody, personalizedSubject, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                campaignId = job.data.campaignId;
                return [4 /*yield*/, prisma_1.prisma.campaign.findUnique({ where: { id: campaignId }, include: { template: true, recipients: { include: { email: true } } } })];
            case 1:
                campaign = _d.sent();
                if (!campaign)
                    throw new Error("Campaign not found");
                return [4 /*yield*/, prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Sending' } })];
            case 2:
                _d.sent();
                _i = 0, _a = campaign.recipients;
                _d.label = 3;
            case 3:
                if (!(_i < _a.length)) return [3 /*break*/, 10];
                recipient = _a[_i];
                _d.label = 4;
            case 4:
                _d.trys.push([4, 7, , 9]);
                personalizedBody = (0, templateVariables_1.replaceVariables)((_b = campaign.template) === null || _b === void 0 ? void 0 : _b.body, recipient.email);
                personalizedSubject = (0, templateVariables_1.replaceVariables)((_c = campaign.template) === null || _c === void 0 ? void 0 : _c.subject, recipient.email);
                return [4 /*yield*/, (0, emailService_1.sendEmails)({
                        to: recipient.email.email,
                        body: personalizedBody,
                        subject: personalizedSubject
                    })];
            case 5:
                _d.sent();
                return [4 /*yield*/, prisma_1.prisma.campaignRecipient.update({ where: { campaignId_emailId: { campaignId: campaignId, emailId: recipient.emailId } }, data: { sentAt: new Date(), status: 'Success' } })];
            case 6:
                _d.sent();
                return [3 /*break*/, 9];
            case 7:
                error_1 = _d.sent();
                console.log("Failed to send email to ".concat(recipient.email.email));
                return [4 /*yield*/, prisma_1.prisma.campaignRecipient.update({ where: { campaignId_emailId: { campaignId: campaignId, emailId: recipient.emailId } }, data: { status: 'Failed' } })];
            case 8:
                _d.sent();
                return [3 /*break*/, 9];
            case 9:
                _i++;
                return [3 /*break*/, 3];
            case 10: return [4 /*yield*/, prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Delivered', sentAt: new Date() } })];
            case 11:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); }, { connection: bullMq_1.bullmqConnection });
worker.on('completed', function (job) {
    console.log("campaign job ".concat(job.id, " completed"));
});
worker.on('failed', function (job, err) {
    console.log("campaing job ".concat(job === null || job === void 0 ? void 0 : job.id, " failed:"), err.message);
});
exports.default = worker;
