import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { env } from '../config/env.js';

let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host ?? '127.0.0.1',
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    // eslint-disable-next-line no-console
    console.log(
      `[db] Created connection pool to ${env.db.host ?? '127.0.0.1'}:${env.db.port}/${
        env.db.name ?? '(no database)'
      }`,
    );
  }

  return pool;
};

export const initDb = async (): Promise<void> => {
  const db = getDbPool();

  try {
    const [rows] = await db.query('SELECT 1 AS ping');
    const ping = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).ping : null;
    // eslint-disable-next-line no-console
    console.log('[db] Connection check succeeded; ping =', ping);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[db] Initial connection check failed:', error);
  }
};

