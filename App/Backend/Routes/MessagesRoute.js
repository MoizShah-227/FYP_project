import express from 'express'
import {
  BirthdayWishEligibility,
  GetMessageInbox,
  GetMessageMixedList,
  GetMessageReceivedList,
  GetMessageSentList,
  GetTeacherSectionsForSemesters,
  GetTeacherSemesterFilters,
  GetMessageThread,
  SendMessageToFilteredStudents,
  SendMessage,
} from '../Controllers/MessagesController.js';

const router = express.Router();

router.get("/birthday-wish-eligibility", BirthdayWishEligibility);
router.get("/inbox/:id", GetMessageInbox);
router.get("/mixed-list/:id", GetMessageMixedList);
router.get("/sent-list/:id", GetMessageSentList);
router.get("/received-list/:id", GetMessageReceivedList);
router.get("/thread/:peer", GetMessageThread);
router.post("/send-message", SendMessage);
router.get("/teacher-semesters/:teacherId", GetTeacherSemesterFilters);
router.post("/teacher-sections", GetTeacherSectionsForSemesters);
router.post("/send-semester-section", SendMessageToFilteredStudents);

export default router;