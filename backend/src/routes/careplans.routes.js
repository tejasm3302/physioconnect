import { Router } from 'express';
import { requireAuth, requireRoleSelfOrAdmin } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

router.get('/customer/:customerId', requireAuth, requireRoleSelfOrAdmin('customerId', 'customer'), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { rows } = await query(
      `SELECT * FROM care_plans WHERE customer_id=$1 ORDER BY updated_at DESC`,
      [customerId]
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/therapist/:therapistId', requireAuth, requireRoleSelfOrAdmin('therapistId', 'therapist'), async (req, res, next) => {
  try {
    const { therapistId } = req.params;
    const { rows } = await query(
      `SELECT * FROM care_plans WHERE therapist_id=$1 ORDER BY updated_at DESC`,
      [therapistId]
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

export default router;