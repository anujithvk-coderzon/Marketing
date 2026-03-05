"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmails = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const sendEmails = async ({ to, subject, body }) => {
    const recipients = Array.isArray(to) ? to : [to];
    const command = new client_ses_1.SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        Destination: {
            ToAddresses: recipients
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            },
            Body: {
                Html: { Data: body, Charset: 'UTF-8' }
            }
        }
    });
    return await sesClient.send(command);
};
exports.sendEmails = sendEmails;
//# sourceMappingURL=emailService.js.map