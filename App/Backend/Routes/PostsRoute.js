import express from 'express'
import {FacultyPosts, PostReactions, PublicPosts, ReactOnPosts} from '../Controllers/PostsController.js';

const router = express.Router();

// User routes
router.get("/public", PublicPosts);
router.get("/faculty", FacultyPosts);
router.post("/reactonpost", ReactOnPosts);
router.get("/postreactions/:id", PostReactions);

export default router;