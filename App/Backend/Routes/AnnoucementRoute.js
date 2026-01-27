import express from 'express'
import {FacultyAnnoucement, PublicAnnoucement, reactionOnAnnouncement} from '../Controllers/AnnoucementConroller.js';

const router = express.Router();

// User routes
router.post("/publicannoucement", PublicAnnoucement);
router.post("/facultyannoucement", FacultyAnnoucement);
router.post("/reactionOnAnnouncement", reactionOnAnnouncement);

export default router;