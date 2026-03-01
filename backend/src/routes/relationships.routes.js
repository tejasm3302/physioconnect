import { Router } from 'express';
import { requireAuth, requireRoleSelfOrAdmin } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

router.get('/active/customer/:customerId', requireAuth, requireRoleSelfOrAdmin('customerId', 'customer'), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { rows } = await query(
      `SELECT * FROM relationships
       WHERE customer_id=$1 AND status='active' AND expires_at > now()
       ORDER BY created_at DESC`,
      [customerId]
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/active/therapist/:therapistId', requireAuth, requireRoleSelfOrAdmin('therapistId', 'therapist'), async (req, res, next) => {
  try {
    const { therapistId } = req.params;
    const { rows } = await query(
      `SELECT * FROM relationships
       WHERE therapist_id=$1 AND status='active' AND expires_at > now()
       ORDER BY created_at DESC`,
      [therapistId]
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

export default router;