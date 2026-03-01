import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import relationshipRoutes from './routes/relationships.routes.js';
import carePlanRoutes from './routes/careplans.routes.js';
import historyRoutes from './routes/history.routes.js';
import migrationRoutes from './routes/migration.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.apiOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'physioconnect-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/care-plans', carePlanRoutes);
app.use('/api/session-history', historyRoutes);
app.use('/api/migration', migrationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
