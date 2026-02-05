import {config} from 'dotenv'
config ({quiet:true});
import express from 'express'
import { errorHandler } from './middlewares/errorHandler';
import route from './routes/rotue';
import {redis} from './helper/redis'
import cookieParser from 'cookie-parser'
const app=express()
const port=process.env.PORT || 4000


app.use(express.json())
app.use('/',route)
app.use(errorHandler)

app.listen(port,()=>{
    console.log(`server listening at http://localhost:${port}`)
})