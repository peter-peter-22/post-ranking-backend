import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, pgTable, real, text, timestamp, uuid, varchar, vector } from 'drizzle-orm/pg-core';
import { users } from './users';
import { embeddingVector } from '../common';

export const posts = pgTable('posts', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    text: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    likeCount: integer().notNull().default(0),
    replyCount: integer().notNull().default(0),
    viewCount: integer().notNull().default(0),
    clickCount: integer().notNull().default(0),
    topic: varchar({ length: 50 }),//the topic that the bots see on the posts. 
    engaging: real().notNull().default(0),//the engagement modifier that decides how much the bots engage with the post. 0-1
    replyingTo: uuid(),
    engagementScoreFrequency: real().notNull().default(0),//engagements score per time since the post was created in hours.
    engagementScore: real().notNull().default(0),//the total engagement score.
    engagementCount: real().notNull().default(0),//the total engagement count.
    engagementScoreRate: real().notNull().default(0),//engagement score per view count.
    embedding: embeddingVector("embedding").notNull(),
    hashtags:varchar({length:50}).notNull().array()
}, (table) => [
    check("engaging clamp", sql`${table.engaging} >= 0 AND ${table.engaging} <= 1`),
    foreignKey({
        columns: [table.replyingTo],
        foreignColumns: [table.id],
        name: "contracts_underlying_id_fkey",
    }).onDelete("cascade"),
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);

export type Post = InferSelectModel<typeof posts>;

export type PostToInsert = InferInsertModel<typeof posts>;

/** Post for the create post function. */
export type PostToCreate = Omit<PostToInsert, "embedding">