import express from 'express'
import {AddEvents,AllEmojis,DeleteEvent,SetReaction,TotalStudents,TotalTeachers} from '../Controllers/AdminController.js';

const router = express.Router();

// User routes
router.post("/addevent", AddEvents);
router.delete("/deleteevent/:id", DeleteEvent);
router.get("/students", TotalStudents);
router.get("/teachers", TotalTeachers);
router.get("/emojis", AllEmojis);
router.post("/emojis", SetReaction);

export default router;