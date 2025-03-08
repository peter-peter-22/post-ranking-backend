import { sql } from "drizzle-orm";
import { db } from "..";

/** Install the necessary extensions on when they aren't installed. */
export async function installExtensions() {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
}