import express from 'express'
import { getMe, loginUser, registerUser, resendVerificationOTP, verifyEmailOTP } from '../controllers/userControllers'
import { cancelCampaign, createCampaign, createEmail, createTemplate, csvEmails, deleteCampaign, deleteEmail, deleteTemplate, editCampaign, editEmail, editTemplate, fetchCampaignRecipients, fetchCampaigns, fetchEmailFilters, fetchEmails, fetchTemplates, sendEmail } from '../controllers/FunctionsController'
import { refresh_Token, verify } from '../middlewares/verification'
import { upload } from '../helper/multer'
const route=express.Router()

// user related (public)
route.post('/register',registerUser)
route.post('/verify/email',verifyEmailOTP)
route.post('/resend/otp',resendVerificationOTP)
route.post('/login',loginUser)
route.get('/refresh-token',refresh_Token)

// authenticated user
route.get('/me',verify,getMe)

// functionality related (protected)
route.post('/send/email',verify,sendEmail)
route.get('/emails',verify,fetchEmails)
route.get('/emails/filters',verify,fetchEmailFilters)
route.post('/email/create',verify,createEmail)
route.delete('/email/delete/:id',verify,deleteEmail)
route.patch('/email/edit/:id',verify,editEmail)
route.post('/template/create',verify,createTemplate)
route.patch('/template/edit/:id',verify,editTemplate)
route.delete('/template/delete/:id',verify,deleteTemplate)
route.get('/templates',verify,fetchTemplates)
route.post('/campaign/create',verify,createCampaign)
route.get('/campaigns',verify,fetchCampaigns)
route.put('/campaign/cancel/:id',verify,cancelCampaign)
route.put('/edit/campaign/:id',verify,editCampaign)
route.delete('/campaign/delete/:id',verify,deleteCampaign)
route.post('/csvEmail',verify,upload.single('csv'),csvEmails)
route.get('/campaign/recipients',verify,fetchCampaignRecipients)

export default route;
