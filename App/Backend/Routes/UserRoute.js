import express from 'express'
import { AddFavourite, changePassword, GetFavourite, login, RemoveFavourite} from '../Controllers/UserController.js';

const router = express.Router();

// User routes
router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/favourite", AddFavourite);
router.get("/favourite/:id", GetFavourite);
router.post("/remove", RemoveFavourite);

export default router;