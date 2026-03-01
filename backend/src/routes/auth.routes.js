import { Router } from 'express';
import { login, logout, refresh, register } from '../services/auth.service.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
