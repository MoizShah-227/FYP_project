import express from 'express'
import {SendMessage} from '../Controllers/MessagesController.js';

const router = express.Router();

// User routes
router.post("/send-message", SendMessage);

export default router;