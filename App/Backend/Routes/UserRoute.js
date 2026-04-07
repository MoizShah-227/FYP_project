import express from 'express'
import { AddFavourite, changePassword, checkSession, GetFavourite, GetStudents, login, logout, RemoveFavourite} from '../Controllers/UserController.js';

const router = express.Router();

// User routes
router.post("/login", login);
router.put("/change-password", changePassword);
router.post("/favourite", AddFavourite);
router.get("/favourite/:id", GetFavourite);
router.get("/students", GetStudents);
router.post("/remove", RemoveFavourite);
router.get("/check-session", checkSession);
router.post("/logout", logout);
export default router;