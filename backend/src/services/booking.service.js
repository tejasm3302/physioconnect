import { z } from 'zod';
import { query } from '../config/db.js';

const completeSchema = z.object({
  bookingId: z.string().uuid(),
  planTitle: z.string().min(1).optional(),
  planGoals: z.string().optional(),
  totalSessions: z.number().int().positive().optional(),
  sessionNotes: z.string().optional()
});

export async function completeBooking(req, res, next) {
  try {
    const body = completeSchema.parse(req.body);

    const bookingResult = await query('SELECT * FROM bookings WHERE id=$1 LIMIT 1', [body.bookingId]);
    if (bookingResult.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    if (booking.therapist_id !== req.auth.sub && req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await query('BEGIN');

    await query('UPDATE bookings SET status=$1, completed_at=now(), updated_at=now() WHERE id=$2', ['completed', body.bookingId]);

    await query(
      `INSERT INTO relationships (customer_id, therapist_id, created_at, expires_at, status)
       VALUES ($1, $2, now(), now() + interval '30 day', 'active')
       ON CONFLICT (customer_id, therapist_id)
       DO UPDATE SET created_at=now(), expires_at=now() + interval '30 day', status='active', updated_at=now()`,
      [booking.customer_id, booking.therapist_id]
    );

    const existingPlan = await query(
      `SELECT * FROM care_plans
       WHERE customer_id=$1 AND therapist_id=$2 AND status='active'
       ORDER BY updated_at DESC LIMIT 1`,
      [booking.customer_id, booking.therapist_id]
    );

    let carePlan;

    if (existingPlan.rowCount > 0) {
      const plan = existingPlan.rows[0];
      const totalSessions = body.totalSessions || plan.total_sessions;
      const completedSessions = Math.min(totalSessions, Number(plan.completed_sessions || 0) + 1);
      const status = completedSessions >= totalSessions ? 'completed' : 'active';

      const updated = await query(
        `UPDATE care_plans
         SET title=$1, goals=$2, total_sessions=$3, completed_sessions=$4, status=$5, updated_at=now()
         WHERE id=$6
         RETURNING *`,
        [
          body.planTitle || plan.title,
          body.planGoals || plan.goals,
          totalSessions,
          completedSessions,
          status,
          plan.id
        ]
      );

      carePlan = updated.rows[0];
    } else {
      const created = await query(
        `INSERT INTO care_plans (customer_id, therapist_id, title, goals, total_sessions, completed_sessions, status)
         VALUES ($1,$2,$3,$4,$5,1,'active')
         RETURNING *`,
        [
          booking.customer_id,
          booking.therapist_id,
          body.planTitle || 'Guided Recovery Care Plan',
          body.planGoals || 'Consistent progress through therapist-managed follow-ups on PhysioConnect.',
          body.totalSessions || 6
        ]
      );
      carePlan = created.rows[0];
    }

    await query(
      `INSERT INTO session_history (booking_id, customer_id, therapist_id, care_plan_id, summary)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        booking.id,
        booking.customer_id,
        booking.therapist_id,
        carePlan.id,
        body.sessionNotes || booking.notes || 'Session completed and recorded in managed care history.'
      ]
    );

    await query('COMMIT');

    return res.json({ success: true, carePlanId: carePlan.id });
  } catch (err) {
    try { await query('ROLLBACK'); } catch {}
    return next(err);
  }
}


