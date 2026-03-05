import {Job, tryCatch, Worker} from 'bullmq'
import { prisma } from '../library/prisma';
import { sendEmails } from './emailService';
import { bullmqConnection } from './bullMq';
import { replaceVariables } from './templateVariables';



const worker=new Worker('campaign-email',async(job:Job)=>{
    const {campaignId}=job.data;
    const campaign=await prisma.campaign.findUnique({where:{id:campaignId},include:{template:true,recipients:{include:{email:true}}}})
    if(!campaign) throw new Error("Campaign not found");
    await prisma.campaign.update({where:{id:campaignId},data:{status:'Sending'}})
    for( const recipient of campaign.recipients){
        try {
            const personalizedBody = replaceVariables(campaign.template?.body!, recipient.email);
            const personalizedSubject = replaceVariables(campaign.template?.subject!, recipient.email);
            await sendEmails({
                to:recipient.email.email,
                body:personalizedBody,
                subject:personalizedSubject
            })
            await prisma.campaignRecipient.update({where:{campaignId_emailId:{campaignId,emailId:recipient.emailId}},data:{sentAt:new Date(),status:'Success'}})
        } catch (error) {
            console.log(`Failed to send email to ${recipient.email.email}`);
            await prisma.campaignRecipient.update({where:{campaignId_emailId:{campaignId,emailId:recipient.emailId}},data:{status:'Failed'}})
        }
    }
    await prisma.campaign.update({where:{id:campaignId},data:{status:'Delivered',sentAt:new Date()}})
},{connection:bullmqConnection})

worker.on('completed',(job)=>{
    console.log(`campaign job ${job.id} completed`);
})
worker.on('failed',(job,err)=>{
    console.log(`campaing job ${job?.id} failed:`,err.message);
})

export default worker