import express from 'express'
import { AddFavourite, blockUser, changePassword, checkSession, GetBlockedUsers, GetFavourite, GetStudents, GetTeachCourses, login, logout, RemoveFavourite, UnblockUser} from '../Controllers/UserController.js';

const router = express.Router();

// User routes
router.post("/login", login);
router.put("/change-password", changePassword);
router.post("/favourite", AddFavourite);
router.get("/favourite/:id", GetFavourite);
router.post("/block", blockUser);
router.get("/blocked/:id", GetBlockedUsers);
router.post("/unblock", UnblockUser);
router.get("/students", GetStudents);
router.get("/get-teach-courses/:id", GetTeachCourses);
router.post("/remove", RemoveFavourite);
router.get("/check-session", checkSession);
router.post("/logout", logout);
export default router;