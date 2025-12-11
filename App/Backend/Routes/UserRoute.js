import express from 'express'
import { login} from '../Controllers/UserController.js';

const router = express.Router();

// User routes
router.post("/login", login);

export default router;