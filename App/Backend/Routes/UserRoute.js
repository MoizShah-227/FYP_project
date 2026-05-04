import express from 'express'
import {
  AddFavourite,
  blockUser,
  changePassword,
  checkSession,
  GetAdminsAndTeachers,
  GetBlockedUsers,
  GetCurrentStudentsForTeacher,
  GetCurrentTeachersForStudent,
  GetFavourite,
  GetFavouriteBirthdays,
  GetFavouriteStudentsForUser,
  GetFavouriteTeachersForEvent,
  GetFavouriteTeachersList,
  GetNotificationsFeed,
  GetStudents,
  GetTeachCourses,
  login,
  logout,
  RemoveFavourite,
  UnblockUser,
} from '../Controllers/UserController.js';

const router = express.Router();

// User routes
router.post("/login", login);
router.put("/change-password", changePassword);
router.post("/favourite", AddFavourite);
router.get("/favourite-teachers/:id", GetFavouriteTeachersForEvent);
router.get("/favourite-teachers-list/:id", GetFavouriteTeachersList);
router.get("/current-teachers/:id", GetCurrentTeachersForStudent);
router.get("/current-students/:id", GetCurrentStudentsForTeacher);
router.get("/favourite-students/:id", GetFavouriteStudentsForUser);
router.get("/favourite/:id", GetFavourite);
router.get("/favourite-birthdays/:id", GetFavouriteBirthdays);
router.get("/notifications-feed/:id", GetNotificationsFeed);
router.post("/block", blockUser);
router.get("/blocked/:id", GetBlockedUsers);
router.post("/unblock", UnblockUser);
router.get("/students", GetStudents);
router.get("/admins-and-teachers", GetAdminsAndTeachers);
router.get("/get-teach-courses/:id", GetTeachCourses);
router.post("/remove", RemoveFavourite);
router.get("/check-session", checkSession);
router.post("/logout", logout);
export default router;