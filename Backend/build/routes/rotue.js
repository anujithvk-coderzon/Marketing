"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const FunctionsController_1 = require("../controllers/FunctionsController");
const verification_1 = require("../middlewares/verification");
const multer_1 = require("../helper/multer");
const route = express_1.default.Router();
// user related (public)
route.post('/register', userControllers_1.registerUser);
route.post('/verify/email', userControllers_1.verifyEmailOTP);
route.post('/resend/otp', userControllers_1.resendVerificationOTP);
route.post('/login', userControllers_1.loginUser);
route.get('/refresh-token', verification_1.refresh_Token);
// authenticated user
route.get('/me', verification_1.verify, userControllers_1.getMe);
// functionality related (protected)
route.post('/send/email', verification_1.verify, FunctionsController_1.sendEmail);
route.get('/emails', verification_1.verify, FunctionsController_1.fetchEmails);
route.get('/emails/filters', verification_1.verify, FunctionsController_1.fetchEmailFilters);
route.post('/email/create', verification_1.verify, FunctionsController_1.createEmail);
route.delete('/email/delete/:id', verification_1.verify, FunctionsController_1.deleteEmail);
route.patch('/email/edit/:id', verification_1.verify, FunctionsController_1.editEmail);
route.post('/template/create', verification_1.verify, FunctionsController_1.createTemplate);
route.patch('/template/edit/:id', verification_1.verify, FunctionsController_1.editTemplate);
route.delete('/template/delete/:id', verification_1.verify, FunctionsController_1.deleteTemplate);
route.get('/templates', verification_1.verify, FunctionsController_1.fetchTemplates);
route.post('/campaign/create', verification_1.verify, FunctionsController_1.createCampaign);
route.get('/campaigns', verification_1.verify, FunctionsController_1.fetchCampaigns);
route.put('/campaign/cancel/:id', verification_1.verify, FunctionsController_1.cancelCampaign);
route.put('/edit/campaign/:id', verification_1.verify, FunctionsController_1.editCampaign);
route.delete('/campaign/delete/:id', verification_1.verify, FunctionsController_1.deleteCampaign);
route.post('/csvEmail', verification_1.verify, multer_1.upload.single('csv'), FunctionsController_1.csvEmails);
route.get('/campaign/recipients', verification_1.verify, FunctionsController_1.fetchCampaignRecipients);
exports.default = route;
//# sourceMappingURL=rotue.js.map