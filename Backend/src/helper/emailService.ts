import {SESClient,SendEmailCommand} from '@aws-sdk/client-ses'

const sesClient= new SESClient({
    region:process.env.AWS_REGION!,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
    }
})
interface sendEmailParams{
    to:string|string[],
    subject:string,
    body:string
}
export const sendEmails=async({to,subject,body}:sendEmailParams)=>{
    const recipients= Array.isArray(to) ? to : [to];
    const command= new SendEmailCommand({
        Source:process.env.SES_FROM_EMAIL!,
        Destination:{
            ToAddresses:recipients
        },
        Message:{
            Subject:{
                Data:subject,
                Charset:'UTF-8'
            },
            Body:{
                Html:{Data:body,Charset:'UTF-8'}
            }
        }
    });
    return await sesClient.send(command)
}