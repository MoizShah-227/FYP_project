# Wishora / FYP — API Documentation

**Base URL:** `http://localhost:5004`  
**Axios config:** `client/config/axiosConfig.js`  
**Backend entry:** `Backend/App.js` (port 5004)

---

## Summary

| Backend prefix | Route file | Controller folder |
|----------------|------------|-------------------|
| `/user` | `Backend/Routes/UserRoute.js` | `Backend/Controllers/UserController.js` |
| `/admin` | `Backend/Routes/AdminRoute.js` | `Backend/Controllers/AdminController.js` |
| `/admin` (announcements) | `Backend/Routes/AnnoucementRoute.js` | `Backend/Controllers/AnnoucementConroller.js` |
| `/posts` | `Backend/Routes/PostsRoute.js` | `Backend/Controllers/PostsController.js` |
| `/message` | `Backend/Routes/MessagesRoute.js` | `Backend/Controllers/MessagesController.js` |
| `/event` | `Backend/Routes/EventRoute.js` | `Backend/Controllers/EventController.js` |
| `/settings` | `Backend/Routes/SettingsRoute.js` | `Backend/Controllers/SettingsController.js` |
| `/emoji` | `Backend/Routes/EmojiRecommendationRoute.js` | `Backend/Controllers/EmojiRecommendationController.js` |
| `/education` | `Backend/Routes/EducationRoute.js` | `Backend/Controllers/EducationController.js` |
| `/showTeacherModel` | `Backend/Routes/showTeacherModelRoutes.js` | `Backend/Controllers/showTeacherModelController.js` |
| `/uploads` | static (App.js) | `uploads/` folder |

---

## 1. Authentication & Session

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| POST | `/user/login` | `client/src/components/Login.jsx` | User login (regno + password), session cookie | `UserRoute` → `UserController.login` |
| POST | `/user/login` | `client/src/settings/ChangePasswordSettingsPage.jsx` | Current password verify karne ke liye (change password se pehle) | Same |
| GET | `/user/check-session` | `client/src/components/Welcome.jsx` | App start par check: logged in hai ya `/login` par bhejna | `UserController.checkSession` |
| POST | `/user/logout` | `client/src/components/Profile.jsx` | Logout, session clear | `UserController.logout` |
| PUT | `/user/change-password` | `client/src/settings/ChangePasswordSettingsPage.jsx` | Naya password save | `UserController.changePassword` |

---

## 2. Admin Dashboard & Analytics

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/admin/students` | `client/src/components/Dashboard.jsx` | Admin dashboard: total students count | `AdminRoute` → `AdminController.TotalStudents` |
| GET | `/admin/teachers` | `client/src/components/Dashboard.jsx` | Admin dashboard: total teachers count | `AdminController.TotalTeachers` |
| GET | `/admin/mostreactions` | `client/src/components/Analytics.jsx` | Sab se zyada use hone wale reaction emojis analytics | `AdminController.MostReactions` |
| GET | `/admin/emojis` | `client/src/components/ReactionSetting.jsx`, `NotificationActivityCard.jsx` | Available reaction emojis list load | `AdminController.AllEmojis` |
| PUT | `/admin/emojis` | `client/src/components/ReactionSetting.jsx` | Admin reaction emoji set update | `AdminController.SetReaction` |

---

## 3. Events (Admin)

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/admin/allevents` | `client/src/components/AddEvents.jsx` | Saari events list | `AdminRoute` → `AdminController.GetAllEvents` |
| POST | `/admin/addevent` | `client/src/components/AddEvents.jsx` | Nayi event create | `AdminController.AddEvents` |
| DELETE | `/admin/deleteevent/:id` | `client/src/components/AddEvents.jsx` | Event delete | `AdminController.DeleteEvent` |

---

## 4. Announcements (Create & Feed)

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| POST | `/admin/publicannoucement` | `client/src/components/PublicAnnouncement.jsx` | Public announcement post (image optional, FormData) | `AnnoucementRoute` → `AnnoucementConroller.PublicAnnoucement` + `Middleware/upload.js` |
| POST | `/admin/facultyannoucement` | `client/src/components/FacultyAnnouncement.jsx` | Faculty-only announcement post | `AnnoucementConroller.FacultyAnnoucement` |
| GET | `/user/announcement-author-candidates` | `client/src/components/MentionTextarea.jsx` | `#mention` ke liye authors list (students/teachers/admins) | `UserRoute` → `UserController.GetAnnouncementAuthorCandidates` |
| GET | `/posts/public` | `client/src/components/Post.jsx` | Public feed posts (userId se filter), har 30s poll | `PostsRoute` → `PostsController.PublicPosts` |

**Backend par hai, abhi frontend se call nahi:**

| GET | `/posts/faculty` | — | Faculty feed | `PostsController.FacultyPosts` |
| POST | `/admin/reactionOnAnnouncement` | — | Announcement par reaction | `AnnoucementConroller.reactionOnAnnouncement` |

---

## 5. Posts — Reactions

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/posts/reaction-eligibility` | `client/src/components/NotificationActivityCard.jsx` | User is post par react kar sakta hai ya nahi | `PostsRoute` → `PostsController.AnnouncementReactionEligibility` |
| POST | `/posts/reactonpost` | `client/src/components/NotificationActivityCard.jsx` | Post par emoji reaction save | `PostsController.ReactOnPosts` |
| GET | `/posts/postreactions/:postId` | `client/src/components/ReactionScreen.jsx` | Ek post ke saare reactions detail | `PostsController.PostReactions` |

**Backend only:** `GET /posts/reactioncount/:id` → reaction count

---

## 6. Emoji AI Recommendation

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| POST | `/emoji/recommend` | `client/src/components/RecommendedEmojiPicker.jsx`, `NotificationActivityCard.jsx` | Post text se suggested emojis (sentiment) | `EmojiRecommendationRoute` → `EmojiRecommendationController.RecommendEmojis` |

**Backend only:** `GET /emoji/all` → all emojis

---

## 7. Users — Favourites, Block, Lists

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/user/students` | `client/src/components/Students.jsx`, `PrivateAccountSettingsPage.jsx` | Students list (teacher/admin) | `UserRoute` → `UserController.GetStudents` |
| GET | `/user/favourite/:id` | `Students.jsx`, `CurrentTeachers.jsx`, `FavouriteTeachers.jsx`, `PeopleListScreen.jsx`, `FavouriteStudents.jsx` | User ki favourite IDs | `UserController.GetFavourite` |
| POST | `/user/favourite` | Same files | Favourite add | `UserController.AddFavourite` |
| POST | `/user/remove` | Same files | Favourite remove | `UserController.RemoveFavourite` |
| GET | `/user/blocked/:id` | `Students.jsx`, `PeopleListScreen.jsx` | Blocked users IDs | `UserController.GetBlockedUsers` |
| POST | `/user/block` | `Students.jsx`, `PeopleListScreen.jsx` | User block | `UserController.blockUser` |
| POST | `/user/unblock` | `Students.jsx`, `PeopleListScreen.jsx` | Unblock | `UserController.UnblockUser` |
| GET | `/user/current-teachers/:id` | `client/src/components/CurrentTeachers.jsx` | Student ke current semester teachers | `UserController.GetCurrentTeachersForStudent` |
| GET | `/user/favourite-teachers-list/:id` | `client/src/components/FavouriteTeachers.jsx` | Favourite teachers full list | `UserController.GetFavouriteTeachersList` |
| GET | `/user/current-students/:id` | `client/src/components/PeopleListScreen.jsx` | Teacher ke current students | `UserController.GetCurrentStudentsForTeacher` |
| GET | `/user/favourite-students/:id` | `PeopleListScreen.jsx` | Favourite students list | `UserController.GetFavouriteStudentsForUser` |
| GET | `/user/favourite-birthdays/:id` | `client/src/components/Notifications.jsx` | Aaj birthday wale favourites | `UserController.GetFavouriteBirthdays` |
| GET | `/user/favourite-teachers/:id` | `Notifications.jsx` | Event wishes ke liye favourite teachers | `UserController.GetFavouriteTeachersForEvent` |
| GET | `/user/notifications-feed/:id` | `Notifications.jsx` | 21 din ka activity feed (posts, etc.) | `UserController.GetNotificationsFeed` |
| GET | `/user/get-teach-courses/:id` | `client/src/components/Subjects.jsx` | Teacher ki courses/subjects | `UserController.GetTeachCourses` |

**Backend only:** `GET /user/admins-and-teachers`

---

## 8. Settings (Preferences)

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/settings/preferences/:userId` | `setting.jsx`, `MuteTimeSettingsPage.jsx`, `PrivateAccountSettingsPage.jsx` | User preferences load (mute, privacy, block opposite gender) | `SettingsRoute` → `SettingsController.getPreferences` |
| PUT | `/settings/preferences` | `setting.jsx`, `MuteTimeSettingsPage.jsx`, `PrivateAccountSettingsPage.jsx` | Preferences save (mute times, private account, block opposite gender) | `SettingsController.upsertPreferences` |

---

## 9. Messages & Messaging

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/message/mixed-list/:userId` | `client/src/components/Messages.jsx` | Inbox: sent + received mixed list | `MessagesRoute` → `MessagesController.GetMessageMixedList` |
| GET | `/message/thread/:peerId` | `client/src/components/MessageThread.jsx` | Do users ke beech conversation | `MessagesController.GetMessageThread` |
| POST | `/message/send-message` | `NotificationActivityCard.jsx`, `FavouriteStudents.jsx`, `BirthDayNotification.jsx` | Direct message bhejna (birthday wish, etc.) | `MessagesController.SendMessage` |
| GET | `/message/birthday-wish-eligibility` | `client/src/components/BirthDayNotification.jsx` | Birthday wish already bheji ya nahi check | `MessagesController.BirthdayWishEligibility` |
| GET | `/message/teacher-semesters/:teacherId` | `client/src/components/SemesterModal.jsx` | Bulk message: semester filters | `MessagesController.GetTeacherSemesterFilters` |
| POST | `/message/teacher-sections` | `client/src/components/SectionModel.jsx` | Selected semesters ke sections | `MessagesController.GetTeacherSectionsForSemesters` |
| POST | `/message/send-semester-section` | `client/src/components/SemesterSectionMessageModal.jsx` | Section/semester students ko bulk message | `MessagesController.SendMessageToFilteredStudents` |

**Backend only (abhi UI se call nahi):**

- `GET /message/inbox/:id`
- `GET /message/sent-list/:id`
- `GET /message/received-list/:id`

---

## 10. Education / Course Messages

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/showTeacherModel/courses/:teacherId` | `client/src/components/CourseModel.jsx` | Teacher ki courses dropdown ke liye | `showTeacherModelRoutes` → `showTeacherModelController.getCourses` |
| POST | `/education/send-courses` | `client/src/components/CourseMessageModal.jsx` | Selected course(s) ke students ko message | `EducationRoute` → `EducationController.sendMessageToCourse` |

**Backend only:** `GET /education/show-courses`

---

## 11. Events (Notifications & Wishes)

| Method | API | Frontend file | Kyun call hoti hai | Backend |
|--------|-----|---------------|-------------------|---------|
| GET | `/event/has-today` | `client/src/components/Notifications.jsx` | Aaj koi event hai ya nahi | `EventRoute` → `EventController.HasEventToday` |
| GET | `/event/today-status` | `Notifications.jsx` | User ne aaj event wish bheji ya nahi | `EventController.GetTodayEventsStatus` |
| POST | `/event/send-bulk-wishes` | `client/src/components/TodayEventWishCard.jsx` | Favourite teachers ko event bulk wishes | `EventController.SendEventBulkWishes` |

---

## 12. Static Files

| URL | Frontend | Kyun |
|-----|----------|------|
| `GET /uploads/*` | `Post.jsx`, `PrivateAccountSettingsPage.jsx` (image URLs) | Profile/post images serve |

---

## Feature → Files Map (Quick)

| Feature | Main frontend files | Backend |
|---------|---------------------|---------|
| Login / Session | `Welcome.jsx`, `Login.jsx`, `Profile.jsx` | `UserRoute`, `UserController` |
| Admin stats | `Dashboard.jsx` | `AdminRoute` |
| Events CRUD | `AddEvents.jsx` | `AdminRoute` |
| Event wishes | `Notifications.jsx`, `TodayEventWishCard.jsx` | `EventRoute` |
| Public feed | `Post.jsx` | `PostsRoute` |
| Create announcement | `PublicAnnouncement.jsx`, `FacultyAnnouncement.jsx`, `MentionTextarea.jsx` | `AnnoucementRoute`, `UserRoute` |
| Reactions | `NotificationActivityCard.jsx`, `ReactionScreen.jsx`, `ReactionSetting.jsx`, `Analytics.jsx` | `PostsRoute`, `AdminRoute`, `EmojiRecommendationRoute` |
| Students / Favourites / Block | `Students.jsx`, `FavouriteStudents.jsx`, `PeopleListScreen.jsx` | `UserRoute` |
| Teachers lists | `CurrentTeachers.jsx`, `FavouriteTeachers.jsx` | `UserRoute` |
| Messages | `Messages.jsx`, `MessageThread.jsx`, modals | `MessagesRoute`, `EducationRoute` |
| Settings | `setting.jsx`, `settings/*` | `SettingsRoute`, `UserRoute` |
| Subjects / Courses | `Subjects.jsx`, `CourseModel.jsx`, `CourseMessageModal.jsx` | `UserRoute`, `showTeacherModelRoutes`, `EducationRoute` |

---

*Generated for FYP Wishora project — May 2026*
