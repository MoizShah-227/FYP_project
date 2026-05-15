#!/usr/bin/env python3
"""Generate API_Documentation.pdf from structured project data."""

from pathlib import Path

try:
    from fpdf import FPDF
except ImportError:
    raise SystemExit("Install: pip install fpdf2")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "API_Documentation.pdf"


class DocPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(7, 51, 61)
        self.cell(0, 8, "Wishora FYP - API Documentation", ln=True)
        self.set_draw_color(251, 159, 36)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Page {self.page_no()}", align="C")


def section(pdf: DocPDF, title: str):
    pdf.ln(3)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(7, 51, 61)
    pdf.multi_cell(0, 7, title)
    pdf.ln(1)


def table_header(pdf: DocPDF, cols, widths):
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_fill_color(240, 242, 245)
    for i, c in enumerate(cols):
        pdf.cell(widths[i], 6, c, border=1, fill=True)
    pdf.ln()


def table_row(pdf: DocPDF, cells, widths, row_h=5):
    pdf.set_font("Helvetica", "", 6.5)
    x0, y0 = pdf.get_x(), pdf.get_y()
    heights = []
    lines_per_cell = []
    for i, text in enumerate(cells):
        w = widths[i]
        pdf.set_xy(x0 + sum(widths[:i]), y0)
        lines = pdf.multi_cell(w, row_h, str(text), border=0, split_only=True)
        lines_per_cell.append(lines or [""])
        heights.append(len(lines or [""]) * row_h)
    h = max(heights) if heights else row_h
    if pdf.get_y() + h > 275:
        pdf.add_page()
        y0 = pdf.get_y()
    for i, text in enumerate(cells):
        x = x0 + sum(widths[:i])
        pdf.set_xy(x, y0)
        pdf.multi_cell(widths[i], row_h, str(text), border=1)
    pdf.set_xy(x0, y0 + h)


def main():
    pdf = DocPDF()
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.add_page()
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(
        0,
        5,
        "Base URL: http://localhost:5004\n"
        "Axios: client/config/axiosConfig.js\n"
        "Backend: Backend/App.js (port 5004)",
    )

    rows = [
        (
            "Auth & Session",
            [
                ("POST", "/user/login", "Login.jsx, ChangePasswordSettingsPage.jsx", "Login / verify old password", "Routes/UserRoute.js", "Controllers/UserController.js"),
                ("GET", "/user/check-session", "Welcome.jsx", "Session check on app load", "UserRoute.js", "UserController.js"),
                ("POST", "/user/logout", "Profile.jsx", "Logout", "UserRoute.js", "UserController.js"),
                ("PUT", "/user/change-password", "ChangePasswordSettingsPage.jsx", "Update password", "UserRoute.js", "UserController.js"),
            ],
        ),
        (
            "Admin Dashboard",
            [
                ("GET", "/admin/students", "Dashboard.jsx", "Student count", "Routes/AdminRoute.js", "Controllers/AdminController.js"),
                ("GET", "/admin/teachers", "Dashboard.jsx", "Teacher count", "AdminRoute.js", "AdminController.js"),
                ("GET", "/admin/mostreactions", "Analytics.jsx", "Top reaction emojis", "AdminRoute.js", "AdminController.js"),
                ("GET", "/admin/emojis", "ReactionSetting.jsx, NotificationActivityCard.jsx", "Load emoji list", "AdminRoute.js", "AdminController.js"),
                ("PUT", "/admin/emojis", "ReactionSetting.jsx", "Update emoji reactions", "AdminRoute.js", "AdminController.js"),
            ],
        ),
        (
            "Events (Admin CRUD)",
            [
                ("GET", "/admin/allevents", "AddEvents.jsx", "List all events", "AdminRoute.js", "AdminController.js"),
                ("POST", "/admin/addevent", "AddEvents.jsx", "Create event", "AdminRoute.js", "AdminController.js"),
                ("DELETE", "/admin/deleteevent/:id", "AddEvents.jsx", "Delete event", "AdminRoute.js", "AdminController.js"),
            ],
        ),
        (
            "Announcements & Feed",
            [
                ("POST", "/admin/publicannoucement", "PublicAnnouncement.jsx", "Public post + image", "Routes/AnnoucementRoute.js", "Controllers/AnnoucementConroller.js"),
                ("POST", "/admin/facultyannoucement", "FacultyAnnouncement.jsx", "Faculty-only post", "AnnoucementRoute.js", "AnnoucementConroller.js"),
                ("GET", "/user/announcement-author-candidates", "MentionTextarea.jsx", "#mention authors", "UserRoute.js", "UserController.js"),
                ("GET", "/posts/public", "Post.jsx", "Public feed (poll 30s)", "Routes/PostsRoute.js", "Controllers/PostsController.js"),
            ],
        ),
        (
            "Post Reactions",
            [
                ("GET", "/posts/reaction-eligibility", "NotificationActivityCard.jsx", "Can user react?", "PostsRoute.js", "PostsController.js"),
                ("POST", "/posts/reactonpost", "NotificationActivityCard.jsx", "Save reaction", "PostsRoute.js", "PostsController.js"),
                ("GET", "/posts/postreactions/:id", "ReactionScreen.jsx", "Reaction details", "PostsRoute.js", "PostsController.js"),
                ("POST", "/emoji/recommend", "RecommendedEmojiPicker.jsx, NotificationActivityCard.jsx", "AI emoji suggest", "Routes/EmojiRecommendationRoute.js", "Controllers/EmojiRecommendationController.js"),
            ],
        ),
        (
            "Users - Favourites & Block",
            [
                ("GET", "/user/students", "Students.jsx, PrivateAccountSettingsPage.jsx", "All students", "UserRoute.js", "UserController.js"),
                ("GET", "/user/favourite/:id", "Many components", "Favourite IDs", "UserRoute.js", "UserController.js"),
                ("POST", "/user/favourite", "Students, Teachers, PeopleList...", "Add favourite", "UserRoute.js", "UserController.js"),
                ("POST", "/user/remove", "Same", "Remove favourite", "UserRoute.js", "UserController.js"),
                ("GET/POST", "/user/blocked, /block, /unblock", "Students.jsx, PeopleListScreen.jsx", "Block management", "UserRoute.js", "UserController.js"),
                ("GET", "/user/current-teachers/:id", "CurrentTeachers.jsx", "Student teachers", "UserRoute.js", "UserController.js"),
                ("GET", "/user/favourite-teachers-list/:id", "FavouriteTeachers.jsx", "Fav teachers list", "UserRoute.js", "UserController.js"),
                ("GET", "/user/current-students/:id", "PeopleListScreen.jsx", "Teacher students", "UserRoute.js", "UserController.js"),
                ("GET", "/user/favourite-students/:id", "PeopleListScreen.jsx", "Fav students", "UserRoute.js", "UserController.js"),
                ("GET", "/user/favourite-birthdays/:id", "Notifications.jsx", "Birthday favourites", "UserRoute.js", "UserController.js"),
                ("GET", "/user/favourite-teachers/:id", "Notifications.jsx", "Teachers for event wish", "UserRoute.js", "UserController.js"),
                ("GET", "/user/notifications-feed/:id", "Notifications.jsx", "21-day activity feed", "UserRoute.js", "UserController.js"),
                ("GET", "/user/get-teach-courses/:id", "Subjects.jsx", "Teacher courses", "UserRoute.js", "UserController.js"),
            ],
        ),
        (
            "Settings",
            [
                ("GET", "/settings/preferences/:userId", "setting.jsx, MuteTime..., PrivateAccount...", "Load prefs", "Routes/SettingsRoute.js", "Controllers/SettingsController.js"),
                ("PUT", "/settings/preferences", "setting.jsx, settings pages", "Save mute/privacy/block OG", "SettingsRoute.js", "SettingsController.js"),
            ],
        ),
        (
            "Messages",
            [
                ("GET", "/message/mixed-list/:id", "Messages.jsx", "Inbox list", "Routes/MessagesRoute.js", "Controllers/MessagesController.js"),
                ("GET", "/message/thread/:peer", "MessageThread.jsx", "Chat thread", "MessagesRoute.js", "MessagesController.js"),
                ("POST", "/message/send-message", "NotificationActivityCard, FavouriteStudents, BirthDayNotification", "Send DM", "MessagesRoute.js", "MessagesController.js"),
                ("GET", "/message/birthday-wish-eligibility", "BirthDayNotification.jsx", "Wish already sent?", "MessagesRoute.js", "MessagesController.js"),
                ("GET", "/message/teacher-semesters/:id", "SemesterModal.jsx", "Semester filter", "MessagesRoute.js", "MessagesController.js"),
                ("POST", "/message/teacher-sections", "SectionModel.jsx", "Sections for semesters", "MessagesRoute.js", "MessagesController.js"),
                ("POST", "/message/send-semester-section", "SemesterSectionMessageModal.jsx", "Bulk section message", "MessagesRoute.js", "MessagesController.js"),
            ],
        ),
        (
            "Education / Courses",
            [
                ("GET", "/showTeacherModel/courses/:id", "CourseModel.jsx", "Teacher courses", "Routes/showTeacherModelRoutes.js", "Controllers/showTeacherModelController.js"),
                ("POST", "/education/send-courses", "CourseMessageModal.jsx", "Message course students", "Routes/EducationRoute.js", "Controllers/EducationController.js"),
            ],
        ),
        (
            "Event Wishes (Notifications)",
            [
                ("GET", "/event/has-today", "Notifications.jsx", "Event today?", "Routes/EventRoute.js", "Controllers/EventController.js"),
                ("GET", "/event/today-status", "Notifications.jsx", "User wish status", "EventRoute.js", "EventController.js"),
                ("POST", "/event/send-bulk-wishes", "TodayEventWishCard.jsx", "Bulk wishes to fav teachers", "EventRoute.js", "EventController.js"),
            ],
        ),
    ]

    widths = [12, 38, 42, 38, 32, 32]
    cols = ["Method", "API", "Frontend", "Why (purpose)", "Backend Route", "Controller"]

    for title, data in rows:
        section(pdf, title)
        table_header(pdf, cols, widths)
        for r in data:
            table_row(pdf, r, widths)

    section(pdf, "Backend APIs (no frontend call yet)")
    backend_only = [
        ("GET", "/posts/faculty", "Faculty feed", "PostsRoute.js", "PostsController.js"),
        ("GET", "/posts/reactioncount/:id", "Reaction count", "PostsRoute.js", "PostsController.js"),
        ("GET", "/message/inbox|sent-list|received-list/:id", "Legacy inbox APIs", "MessagesRoute.js", "MessagesController.js"),
        ("GET", "/user/admins-and-teachers", "Staff list", "UserRoute.js", "UserController.js"),
        ("GET", "/education/show-courses", "Show courses", "EducationRoute.js", "EducationController.js"),
        ("GET", "/emoji/all", "All emojis", "EmojiRecommendationRoute.js", "EmojiRecommendationController.js"),
        ("POST", "/admin/reactionOnAnnouncement", "Announcement reaction", "AnnoucementRoute.js", "AnnoucementConroller.js"),
    ]
    widths2 = [14, 52, 50, 40, 40]
    table_header(pdf, ["Method", "API", "Feature", "Route file", "Controller"], widths2)
    for r in backend_only:
        table_row(pdf, r, widths2)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"PDF created: {OUT}")


if __name__ == "__main__":
    main()
