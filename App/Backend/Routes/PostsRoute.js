import express from 'express'
import {FacultyPosts, PublicPosts} from '../Controllers/PostsController.js';

const router = express.Router();

// User routes
router.get("/public", PublicPosts);
router.get("/faculty", FacultyPosts);

export default router;