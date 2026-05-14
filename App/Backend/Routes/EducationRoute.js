import express from 'express'
import {sendMessageToCourse, ShowCourses} from '../Controllers/EducationController.js';

const router = express.Router();

// routes
router.get("/show-courses", ShowCourses);
router.post("/send-courses", sendMessageToCourse);

export default router;