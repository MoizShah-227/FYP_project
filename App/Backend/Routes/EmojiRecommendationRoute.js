import express from "express";
import {
  GetAllEmojis,
  RecommendEmojis,
} from "../Controllers/EmojiRecommendationController.js";

const router = express.Router();

router.post("/recommend", RecommendEmojis);
router.get("/all", GetAllEmojis);

export default router;
