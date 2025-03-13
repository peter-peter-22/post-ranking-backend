import { InferInsertModel, InferSelectModel, SQL, sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';
import { users } from './users';

/**
 * @todo The scores are hardcoded because template literal variables cause bugs.
 */
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
    //engagements score per time since the post was created in hours.
    engagementScoreFrequency: real().notNull().generatedAlwaysAs(
        (): SQL => sql`(
            (
                ${posts.likeCount} * 3 +
                ${posts.replyCount} * 6 +
                ${posts.clickCount} * 1
            )::REAL
            /
            COALESCE(NULLIF(
                EXTRACT(EPOCH FROM ${posts.createdAt}) / 3600,
            0), 1)  
        )`
    ),
    //the total engagement score.
    engagementScore: real().notNull().generatedAlwaysAs(
        (): SQL => sql`(
            ${posts.likeCount} * 3 +
            ${posts.replyCount} * 6 +
            ${posts.clickCount} * 1
        )`
    ),
    //the total engagement count.
    engagementCount: real().notNull().generatedAlwaysAs(
        (): SQL => sql`(
            ${posts.likeCount} +
            ${posts.replyCount} +
            ${posts.clickCount}
        )`
    ),
    //engagement score per view count.
    engagementScoreRate: real().notNull().generatedAlwaysAs(
        (): SQL => sql`(
            (
                ${posts.likeCount} * 3 +
                ${posts.replyCount} * 6 +
                ${posts.clickCount} * 1
            )::REAL
            /
            COALESCE(NULLIF(
                ${posts.viewCount},
            0), 1)
        )`,
    ),
    embedding: embeddingVector("embedding").notNull(),
    //the texts of the hashtags. used for trend calculations
    hashtags: varchar({ length: 50 }).notNull().array()
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