import express from 'express'
import {emojiRecommendation} from '../Controllers/EmojiRecommendationController.js';

const router = express.Router();

// User routes
router.get("/emoji/:text", emojiRecommendation);

export default router;