import express from 'express'
import {FacultyAnnoucement, getPublicAnnouncements, PublicAnnoucement, reactionOnAnnouncement} from '../Controllers/AnnoucementConroller.js';
import { uploadAnnouncementImage } from '../Middleware/upload.js';

const router = express.Router();

// User routes
router.post("/publicannoucement", uploadAnnouncementImage.single("image"), PublicAnnoucement);
router.post("/facultyannoucement", uploadAnnouncementImage.single("image"), FacultyAnnoucement);
router.post("/reactionOnAnnouncement", reactionOnAnnouncement);
router.post("/publicAnnouncement", getPublicAnnouncements);

export default router;