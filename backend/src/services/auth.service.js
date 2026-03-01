import { z } from 'zod';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const registerSchema = z.object({
  role: z.enum(['customer', 'therapist']),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional().default('')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await query('SELECT id FROM users WHERE lower(email)=lower($1) LIMIT 1', [data.email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(data.password);
    const created = await query(
      `INSERT INTO users (role, email, password_hash, full_name, phone, verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, role, email, full_name AS "fullName", phone, verified`,
      [data.role, data.email, passwordHash, data.fullName, data.phone, data.role === 'customer']
    );

    return res.status(201).json({ user: created.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await query(
      `SELECT id, role, email, full_name AS "fullName", phone, verified, password_hash
       FROM users WHERE lower(email)=lower($1) LIMIT 1`,
      [data.email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const ok = await verifyPassword(data.password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
      secure: env.nodeEnv === 'production',
      path: '/api/auth/refresh'
    });

    delete user.password_hash;
    return res.json({ user, accessToken });
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Missing refresh token' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const exists = await query('SELECT id FROM refresh_tokens WHERE token=$1 AND revoked_at IS NULL LIMIT 1', [refreshToken]);
    if (exists.rowCount === 0) {
      return res.status(401).json({ error: 'Refresh token revoked' });
    }

    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role, email: payload.email });
    return res.json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await query('UPDATE refresh_tokens SET revoked_at=now() WHERE token=$1', [refreshToken]);
    }
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}