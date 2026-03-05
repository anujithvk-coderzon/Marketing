"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCampaignJob = exports.scheduleCampaignJob = exports.bullmqConnection = exports.campaignQueue = void 0;
const bullmq_1 = require("bullmq");
const redisUrl = new URL(process.env.REDIS);
const connection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port, 10),
    maxRetriesPerRequest: null
};
exports.campaignQueue = new bullmq_1.Queue('campaign-email', {
    connection,
    defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false
    }
});
exports.bullmqConnection = connection;
const scheduleCampaignJob = async function (campaignId, scheduledAt) {
    const existingJob = await exports.campaignQueue.getJob(campaignId);
    if (existingJob)
        await existingJob.remove();
    const delay = Math.max(0, new Date(scheduledAt).getTime() - Date.now());
    await exports.campaignQueue.add('send-campaign', { campaignId }, {
        jobId: campaignId,
        delay
    });
};
exports.scheduleCampaignJob = scheduleCampaignJob;
const removeCampaignJob = async function (campaignId) {
    const existingJob = await exports.campaignQueue.getJob(campaignId);
    if (existingJob)
        await existingJob.remove();
};
exports.removeCampaignJob = removeCampaignJob;
//# sourceMappingURL=bullMq.js.map