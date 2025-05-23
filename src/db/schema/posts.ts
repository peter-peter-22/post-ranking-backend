import { InferInsertModel, InferSelectModel, isNull, SQL, sql } from 'drizzle-orm';
import { boolean, check, foreignKey, index, integer, jsonb, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector, keyword, MediaFile } from '../common';
import { users } from './users';

/** The posts. */
export const posts = pgTable('posts', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    text: text(),
    createdAt: timestamp().notNull().defaultNow(),
    //engagement counts
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
    //the text that was used to generate the embedding vector
    embeddingText: text(),
    //the embedding vector
    embedding: embeddingVector("embedding"),
    //all kinds of keywords for the post. used for trend tracking. 
    keywords: keyword().notNull().array(),
    //is the post published or not. pending posts need an id to define where their media is uploaded.
    pending: boolean().notNull().default(false),
    //the files those belong to this post.
    media: jsonb().$type<MediaFile[]>(),
    commentScore: real().notNull().generatedAlwaysAs(
        ():SQL=>sql`
            ((${posts.likeCount} + ${posts.replyCount} + ${posts.clickCount} + 10) / (${posts.viewCount} + 10)) 
            * 
            (${posts.likeCount} + ${posts.replyCount} + ${posts.clickCount})`
    )
}, (table) => [
    check("engaging clamp", sql`${table.engaging} >= 0 AND ${table.engaging} <= 1`),
    foreignKey({
        columns: [table.replyingTo],
        foreignColumns: [table.id],
        name: "reply_to_post_fkey",
    }).onDelete("cascade"),
    index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
    index('replyingToIndex').on(table.replyingTo.nullsFirst(), table.userId, table.createdAt.desc()),// used for reply counting, followed reply
    index('userReplyHistoryIndex').on(table.userId, table.createdAt.desc()),// used for reply engagement history
    index('recencyIndex').on(table.createdAt.desc()),
    index('recentPostsIndex').on(table.replyingTo, table.createdAt.desc()),// used for user cluster trends
    index('postsKeywordIndex').using("gin", table.keywords).where(isNull(table.replyingTo)),// used for trending cancidates.
    index('orderRepliesByScoreIndex').on(table.replyingTo.nullsLast(),table.commentScore.desc(),table.createdAt.desc()),// used for ordering replies in the comment section of a post.
]);

export type Post = InferSelectModel<typeof posts>;

export type PostToInsert = InferInsertModel<typeof posts>;