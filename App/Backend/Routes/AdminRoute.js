import express from 'express'
import {AddEvents,AllEmojis,DeleteEvent,SetReaction,TotalStudents,TotalTeachers,MostReactions} from '../Controllers/AdminController.js';

const router = express.Router();

// User routes
router.post("/addevent", AddEvents);
router.delete("/deleteevent/:id", DeleteEvent);
router.get("/students", TotalStudents);
router.get("/teachers", TotalTeachers);
router.get("/emojis", AllEmojis);
router.put("/emojis", SetReaction);
router.get("/mostreactions", MostReactions);

export default router;