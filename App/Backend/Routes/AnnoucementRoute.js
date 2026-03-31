import express from 'express'
import {FacultyAnnoucement, getPublicAnnouncements, PublicAnnoucement, reactionOnAnnouncement} from '../Controllers/AnnoucementConroller.js';

const router = express.Router();

// User routes
router.post("/publicannoucement", PublicAnnoucement);
router.post("/facultyannoucement", FacultyAnnoucement);
router.post("/reactionOnAnnouncement", reactionOnAnnouncement);
router.post("/publicAnnouncement", getPublicAnnouncements);

export default router;