import { getTableColumns, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';
import { clusters } from '../schema/clusters';

/** The users. */
export const users = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    handle: varchar({ length: 50 }).notNull().unique(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp().defaultNow(),
    followerCount: integer().notNull().default(0),
    followingCount:integer().notNull().default(0),
    interests: varchar({ length: 50 }).array().notNull().default([]),//what kinds of posts the bot user creates and wants to see
    bot: boolean().notNull().default(false),
    embedding: embeddingVector("embedding"),
    clusterId:integer().references(()=>clusters.id,{onDelete:"set null"})
},(t)=>[
    index().on(t.clusterId),
]);

export type User = InferSelectModel<typeof users>;

export type UserToInsert = InferInsertModel<typeof users>;

const { embedding, ...rest } = getTableColumns(users)
/** User columns without the embedding vector. */
export const UserCommonColumns = rest;

/** User without the embedding vector. */
export type UserCommon = Omit<User, "embedding">