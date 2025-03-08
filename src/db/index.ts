import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { installExtensions } from './seed/extensions';

const pool = new pg.Pool({
    connectionString: process.env.DB_URL,
});

export const db = drizzle({ client: pool });

await installExtensions()