import express from 'express'
import { AnnouncementReactionEligibility, FacultyPosts, PostReactionUserCount, PostReactions, PublicPosts, ReactOnPosts } from '../Controllers/PostsController.js';

const router = express.Router();

// User routes
router.get("/public", PublicPosts);
router.get("/faculty", FacultyPosts);
router.get("/reaction-eligibility", AnnouncementReactionEligibility);
router.post("/reactonpost", ReactOnPosts);
router.get("/postreactions/:id", PostReactions);
router.get("/reactioncount/:id", PostReactionUserCount);

export default router;