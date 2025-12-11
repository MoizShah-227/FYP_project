import express from 'express'
import { changePassword, login} from '../Controllers/UserController.js';

const router = express.Router();

// User routes
router.post("/login", login);
router.post("/change-password", changePassword);

export default router;