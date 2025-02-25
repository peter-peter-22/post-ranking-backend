import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    handle: varchar({ length: 50 }).notNull().unique(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp().defaultNow(),
    followerCount: integer().notNull().default(0),
    interests: varchar({ length: 50 }).array().notNull().default([]),//what kinds of posts the user creates and wants to see
    bot: boolean().notNull().default(false)
});

export type User = InferSelectModel<typeof users>;

export type UserToInsert = InferInsertModel<typeof users>; 