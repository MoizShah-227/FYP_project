import express from 'express'
import { getCourses } from '../Controllers/showTeacherModelController.js';

const router = express.Router();

// showTeachModel routes
router.get("/courses/:teacherId", getCourses);
export default router;