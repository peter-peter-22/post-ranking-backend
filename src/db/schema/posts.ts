import { InferInsertModel, InferSelectModel, SQL, sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';
import { users } from './users';

export const posts = pgTable('posts', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    text: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    likeCount: integer().notNull().default(0),
    replyCount: integer().notNull().default(0),
    viewCount: integer().notNull().default(0),
    clickCount: integer().notNull().default(0),
    //the topic that the bots see on the posts. 
    topic: varchar({ length: 50 }),
    //the engagement modifier that decides how much the bots engage with the post. 0-1
    engaging: real().notNull().default(0),
    replyingTo: uuid(),
    //the total engagement count.
    engagementCount: real().notNull().generatedAlwaysAs(
        (): SQL => sql`(
            ${posts.likeCount} +
            ${posts.replyCount} +
            ${posts.clickCount} 
        )`
    ),
    embedding: embeddingVector("embedding"),
    //all kinds of keywords for the post. used for trend tracking. 
    keywords: varchar({ length: 50 }).notNull().array()
}, (table) => [
    check("engaging clamp", sql`${table.engaging} >= 0 AND ${table.engaging} <= 1`),
    foreignKey({
        columns: [table.replyingTo],
        foreignColumns: [table.id],
        name: "reply_to_post_fkey",
    }).onDelete("cascade"),
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
    index('replyingToIndex').on(table.replyingTo, table.userId, table.createdAt.desc()),//used for reply counting, followed reply
    index('userReplyHistoryIndex').on(table.userId, table.createdAt.desc()),//used for reply engagement history
]);

export type Post = InferSelectModel<typeof posts>;

export type PostToInsert = InferInsertModel<typeof posts>;

/** Post for the create post function. */
export type PostToCreate = Omit<PostToInsert, "embedding">