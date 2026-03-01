import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

const payloadSchema = z.object({
  users: z.array(z.any()).default([]),
  bookings: z.array(z.any()).default([]),
  payments: z.array(z.any()).default([]),
  relationships: z.array(z.any()).default([]),
  carePlans: z.array(z.any()).default([]),
  sessionHistory: z.array(z.any()).default([])
});

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

async function normalizePasswordHash(rawPassword) {
  if (!rawPassword) {
    return bcrypt.hash('ChangeMe123!', 12);
  }

  if (isBcryptHash(rawPassword)) {
    return rawPassword;
  }

  let plain = rawPassword;

  try {
    const decoded = Buffer.from(rawPassword, 'base64').toString('utf8');
    if (decoded && decoded.trim().length > 0) {
      plain = decoded;
    }
  } catch {}

  return bcrypt.hash(String(plain), 12);
}

router.post('/import-localstorage', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    if (!env.allowMigrationImport) {
      return res.status(403).json({ error: 'Migration import disabled' });
    }

    const data = payloadSchema.parse(req.body);

    await query('BEGIN');

    const userIdMap = new Map();
    const resolveUserId = (id) => userIdMap.get(id) || id;

    for (const user of data.users) {
      const passwordHash = await normalizePasswordHash(user.password || user.password_hash);

      const result = await query(
        `INSERT INTO users (id, role, email, password_hash, full_name, phone, verified, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8, now()))
         ON CONFLICT (email) DO UPDATE SET
           role = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           phone = EXCLUDED.phone,
           verified = EXCLUDED.verified
         RETURNING id, email`,
        [
          user.id,
          user.role,
          user.email,
          passwordHash,
          user.fullName || user.full_name || '',
          user.phone || '',
          Boolean(user.verified),
          user.createdAt || user.created_at || null
        ]
      );

      const persistedUserId = result.rows?.[0]?.id || user.id;
      if (user.id) {
        userIdMap.set(user.id, persistedUserId);
      }
    }

    for (const booking of data.bookings) {
      const customerId = resolveUserId(booking.customerId || booking.customer_id);
      const therapistId = resolveUserId(booking.therapistId || booking.therapist_id);

      await query(
        `INSERT INTO bookings (id, customer_id, therapist_id, date, time, duration_minutes, visit_type, status, price, notes, created_at, completed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11, now()),$12)
         ON CONFLICT (id) DO NOTHING`,
        [
          booking.id,
          customerId,
          therapistId,
          booking.date,
          booking.time,
          booking.duration || booking.duration_minutes || 60,
          booking.visitType || booking.visit_type || 'clinic',
          booking.status || 'pending',
          booking.price || 0,
          booking.notes || '',
          booking.createdAt || booking.created_at || null,
          booking.completedAt || booking.completed_at || null
        ]
      );
    }

    for (const payment of data.payments) {
      const therapistId = resolveUserId(payment.therapistId || payment.therapist_id);

      await query(
        `INSERT INTO payments (id, therapist_id, plan_id, plan_name, amount, method, status, payment_ref, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, now()))
         ON CONFLICT (id) DO NOTHING`,
        [
          payment.id,
          therapistId,
          payment.planId || payment.plan_id || null,
          payment.planName || payment.plan_name || null,
          payment.amount || 0,
          payment.method || 'unknown',
          payment.status || 'success',
          payment.paymentId || payment.payment_ref || null,
          payment.date || payment.created_at || null
        ]
      );
    }

    for (const rel of data.relationships) {
      const customerId = resolveUserId(rel.customerId || rel.customer_id);
      const therapistId = resolveUserId(rel.therapistId || rel.therapist_id);

      await query(
        `INSERT INTO relationships (id, customer_id, therapist_id, created_at, expires_at, status)
         VALUES ($1,$2,$3,COALESCE($4, now()),$5,COALESCE($6, 'active')::relationship_status)
         ON CONFLICT (id) DO NOTHING`,
        [
          rel.id,
          customerId,
          therapistId,
          rel.createdAt || rel.created_at || null,
          rel.expiresAt || rel.expires_at,
          rel.status || 'active'
        ]
      );
    }

    for (const plan of data.carePlans) {
      const customerId = resolveUserId(plan.customerId || plan.customer_id);
      const therapistId = resolveUserId(plan.therapistId || plan.therapist_id);

      await query(
        `INSERT INTO care_plans (id, customer_id, therapist_id, title, goals, total_sessions, completed_sessions, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, now()),COALESCE($10, now()))
         ON CONFLICT (id) DO NOTHING`,
        [
          plan.id,
          customerId,
          therapistId,
          plan.title || 'Guided Recovery Care Plan',
          plan.goals || '',
          plan.totalSessions || plan.total_sessions || 6,
          plan.completedSessions || plan.completed_sessions || 0,
          plan.status || 'active',
          plan.createdAt || plan.created_at || null,
          plan.updatedAt || plan.updated_at || null
        ]
      );
    }

    for (const item of data.sessionHistory) {
      const customerId = resolveUserId(item.customerId || item.customer_id);
      const therapistId = resolveUserId(item.therapistId || item.therapist_id);

      await query(
        `INSERT INTO session_history (id, booking_id, customer_id, therapist_id, care_plan_id, summary, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, now()))
         ON CONFLICT (id) DO NOTHING`,
        [
          item.id,
          item.bookingId || item.booking_id || null,
          customerId,
          therapistId,
          item.carePlanId || item.care_plan_id || null,
          item.summary || 'Imported session record',
          item.createdAt || item.created_at || null
        ]
      );
    }

    await query('COMMIT');

    return res.json({
      success: true,
      imported: {
        users: data.users.length,
        bookings: data.bookings.length,
        payments: data.payments.length,
        relationships: data.relationships.length,
        carePlans: data.carePlans.length,
        sessionHistory: data.sessionHistory.length
      }
    });
  } catch (err) {
    try {
      await query('ROLLBACK');
    } catch {}
    return next(err);
  }
});

export default router;