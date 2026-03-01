import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

async function bootstrap() {
  try {
    await pool.query('SELECT 1');
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start backend:', err);
    process.exit(1);
  }
}

bootstrap();
