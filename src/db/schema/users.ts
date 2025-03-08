import { getTableColumns, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, timestamp, uuid, varchar, vector } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    handle: varchar({ length: 50 }).notNull().unique(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp().defaultNow(),
    followerCount: integer().notNull().default(0),
    interests: varchar({ length: 50 }).array().notNull().default([]),//what kinds of posts the user creates and wants to see
    bot: boolean().notNull().default(false),
    embedding: vector({ dimensions: 384 })//384 dimensions for 'all-MiniLM-L6-v2'
});

export type User = InferSelectModel<typeof users>;

export type UserToInsert = InferInsertModel<typeof users>;

const { embedding, ...rest } = getTableColumns(users)
/** User columns without the embedding vector. */
export const UserCommonColumns = rest;

/** User without the embedding vector. */
export type UserCommon = Omit<User, "embedding">