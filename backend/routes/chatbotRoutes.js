import express from 'express';
import { chatbotReply } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/message', chatbotReply);

export default router;
