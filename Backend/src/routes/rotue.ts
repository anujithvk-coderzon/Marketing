import express from 'express'
import { loginUser, registerUser } from '../controllers/userControllers'
import { sendEmail } from '../controllers/FunctionsController'
import { verify } from '../middlewares/verification'
const route=express.Router()

route.post('/register',registerUser)
route.post('/login',loginUser)
route.post('/send/email',verify,sendEmail)

export default route;