interface sendEmailParams {
    to: string | string[];
    subject: string;
    body: string;
}
export declare const sendEmails: ({ to, subject, body }: sendEmailParams) => Promise<import("@aws-sdk/client-ses").SendEmailCommandOutput>;
export {};
//# sourceMappingURL=emailService.d.ts.map