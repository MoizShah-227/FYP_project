import express from 'express'
import {} from '../Controllers/AnnoucementConroller.js';

const router = express.Router();

// User routes
router.post("/annoucement", AddEvents);

export default router;