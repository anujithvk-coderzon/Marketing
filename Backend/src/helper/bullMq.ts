import {Queue} from 'bullmq'

const redisUrl= new URL(process.env.REDIS!)

const connection={
    host:redisUrl.hostname,
    port:parseInt(redisUrl.port,10),
    maxRetriesPerRequest:null 
}

export const campaignQueue=new Queue('campaign-email',{
    connection,
    defaultJobOptions:{
        attempts:1,
        removeOnComplete:true,
        removeOnFail:false
    }
})
export const bullmqConnection=connection
export const scheduleCampaignJob=async function (campaignId:string,scheduledAt:Date) {
    const existingJob=await campaignQueue.getJob(campaignId)
    if(existingJob) await existingJob.remove()
    const delay=Math.max(0,new Date(scheduledAt).getTime()-Date.now())
    await campaignQueue.add('send-campaign',{campaignId},{
        jobId:campaignId,
        delay
    })
}

export const removeCampaignJob=async function (campaignId:string) {
    const existingJob=await campaignQueue.getJob(campaignId)
    if(existingJob) await existingJob.remove()
}