import express from "express";
import { getPreferences, upsertPreferences } from "../Controllers/SettingsController.js";

const router = express.Router();

router.get("/preferences/:userId", getPreferences);
router.put("/preferences", upsertPreferences);

export default router;
