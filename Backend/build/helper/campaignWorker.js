"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const prisma_1 = require("../library/prisma");
const emailService_1 = require("./emailService");
const bullMq_1 = require("./bullMq");
const templateVariables_1 = require("./templateVariables");
const worker = new bullmq_1.Worker('campaign-email', async (job) => {
    const { campaignId } = job.data;
    const campaign = await prisma_1.prisma.campaign.findUnique({ where: { id: campaignId }, include: { template: true, recipients: { include: { email: true } } } });
    if (!campaign)
        throw new Error("Campaign not found");
    await prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Sending' } });
    for (const recipient of campaign.recipients) {
        try {
            const personalizedBody = (0, templateVariables_1.replaceVariables)(campaign.template?.body, recipient.email);
            const personalizedSubject = (0, templateVariables_1.replaceVariables)(campaign.template?.subject, recipient.email);
            await (0, emailService_1.sendEmails)({
                to: recipient.email.email,
                body: personalizedBody,
                subject: personalizedSubject
            });
            await prisma_1.prisma.campaignRecipient.update({ where: { campaignId_emailId: { campaignId, emailId: recipient.emailId } }, data: { sentAt: new Date(), status: 'Success' } });
        }
        catch (error) {
            console.log(`Failed to send email to ${recipient.email.email}`);
            await prisma_1.prisma.campaignRecipient.update({ where: { campaignId_emailId: { campaignId, emailId: recipient.emailId } }, data: { status: 'Failed' } });
        }
    }
    await prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'Delivered', sentAt: new Date() } });
}, { connection: bullMq_1.bullmqConnection });
worker.on('completed', (job) => {
    console.log(`campaign job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.log(`campaing job ${job?.id} failed:`, err.message);
});
exports.default = worker;
//# sourceMappingURL=campaignWorker.js.map