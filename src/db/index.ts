import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { installExtensions } from './seed/extensions';
import { env } from '../zod/env';

const pool = new pg.Pool({
    connectionString: env.DB_URL,
});

export const db = drizzle({ client: pool });

pool.
db.$client.
await installExtensions()