import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { completeBooking } from '../services/booking.service.js';

const router = Router();

router.post('/complete', requireAuth, requireRole('therapist', 'admin'), completeBooking);

export default router;
