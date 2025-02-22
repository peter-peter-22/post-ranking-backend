import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    handle: varchar({ length: 50 }).notNull().unique(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp().defaultNow(),
    followerCount: integer().notNull().default(0)
});

export type User = InferSelectModel<typeof users>; 