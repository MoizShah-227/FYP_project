import express from "express";
import { GetTodayEventsStatus, HasEventToday, SendEventBulkWishes } from "../Controllers/EventController.js";

const router = express.Router();

router.get("/has-today", HasEventToday);
router.get("/today-status", GetTodayEventsStatus);
router.post("/send-bulk-wishes", SendEventBulkWishes);

export default router;
