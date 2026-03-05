export declare const UserRole: {
    readonly Admin: "Admin";
    readonly User: "User";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const CampaignStatus: {
    readonly Draft: "Draft";
    readonly Scheduled: "Scheduled";
    readonly Delivered: "Delivered";
    readonly Cancelled: "Cancelled";
    readonly Sending: "Sending";
};
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];
export declare const recipientStatus: {
    readonly Pending: "Pending";
    readonly Cancelled: "Cancelled";
    readonly Success: "Success";
    readonly Failed: "Failed";
};
export type recipientStatus = (typeof recipientStatus)[keyof typeof recipientStatus];
//# sourceMappingURL=enums.d.ts.map