import { Queue } from 'bullmq';
export declare const campaignQueue: Queue<any, any, string, any, any, string>;
export declare const bullmqConnection: {
    host: string;
    port: number;
    maxRetriesPerRequest: null;
};
export declare const scheduleCampaignJob: (campaignId: string, scheduledAt: Date) => Promise<void>;
export declare const removeCampaignJob: (campaignId: string) => Promise<void>;
//# sourceMappingURL=bullMq.d.ts.map