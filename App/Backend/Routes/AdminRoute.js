import express from 'express'
import {AddEvents,DeleteEvent,TotalStudents,TotalTeachers} from '../Controllers/AdminController.js';

const router = express.Router();

// User routes
router.post("/addevent", AddEvents);
router.delete("/deleteevent/:id", DeleteEvent);
router.get("/students", TotalStudents);
router.get("/teachers", TotalTeachers);

export default router;