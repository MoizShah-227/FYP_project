import express from 'express'
import {FacultyAnnoucement, PublicAnnoucement} from '../Controllers/AnnoucementConroller.js';

const router = express.Router();

// User routes
router.post("/publicannoucement", PublicAnnoucement);
router.post("/facultyannoucement", FacultyAnnoucement);

export default router;