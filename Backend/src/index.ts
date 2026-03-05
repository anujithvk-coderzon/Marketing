import {config} from 'dotenv'
config ({quiet:true});
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler';
import route from './routes/rotue';
import {connectRedis} from './helper/redis'
import './helper/campaignWorker'
const app=express()
const port=process.env.PORT || 4000


app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/',route)
app.use(errorHandler)
app.listen(port,async ()=>{
    console.log(`server listening at http://localhost:${port}`)
    await connectRedis()
    console.log('redis connected')
})