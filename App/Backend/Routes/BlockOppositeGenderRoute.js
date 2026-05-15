import express from "express";
import {
  blockOppositeGender,
  unblockOppositeGender,
} from "../Controllers/BlockOppositeGenderController.js";

const router = express.Router();

router.post("/block-opposite-gender", blockOppositeGender);
router.post("/unblock-opposite-gender", unblockOppositeGender);

export default router;
