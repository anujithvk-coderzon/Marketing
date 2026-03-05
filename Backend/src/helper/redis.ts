import {createClient} from 'redis'

export const redis=createClient({
    url:process.env.REDIS!
})
redis.on('error',err=>console.log('failed to connect with redis',err))

export async function connectRedis(){
    if(!redis.isOpen){
        await redis.connect()
    }
}
