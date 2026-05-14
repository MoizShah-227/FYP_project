import multer from "multer";
import path from "path";
import fs from "fs";

/** Where uploaded announcement images get saved. */
const ANNOUNCEMENT_DIR = path.join("uploads", "announcements");

if (!fs.existsSync(ANNOUNCEMENT_DIR)) {
  fs.mkdirSync(ANNOUNCEMENT_DIR, { recursive: true });
}

const sanitize = (name) =>
  String(name || "file")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 60) || "file";

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, ANNOUNCEMENT_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || "";
    const base = sanitize(path.basename(file.originalname, ext));
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    cb(null, `${stamp}_${rand}_${base}${ext}`);
  },
});

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function fileFilter(_req, file, cb) {
  if (ALLOWED.has(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed (jpg, png, gif, webp)"));
}

export const uploadAnnouncementImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/** Build the public URL stored in DB (relative to /uploads static mount). */
export const announcementImageRelPath = (filename) =>
  filename ? path.posix.join("announcements", filename) : null;
