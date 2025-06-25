import { eq, InferInsertModel, InferSelectModel, isNotNull, isNull, SQL, sql } from 'drizzle-orm';
import { boolean, check, foreignKey, index, integer, jsonb, pgTable, real, text, timestamp, uuid, varchar, vector } from 'drizzle-orm/pg-core';
import { embeddingVector, keyword, MediaFile } from '../common';
import { users } from './users';

// Queries and their indexes

// Main feed: embedding similarity candidates: recentPostsESimIndex
// Relevant posts: embedding similarity candidates with threshold: recentPostsESimIndex
// Replies: publisher candidates: replyingToIndex
// Replies: followed candidates: replyingToIndex
// Replies: rest of candidates: orderRepliesByScoreIndex
// Main feed and relevant posts: trend candidates, counting keywords between date intervals for trend and cluster trend updates: recentPostsIndex
// Posts and replies of a user, replies of engagement history: userContentsIndex
// Deleting expired pending posts: pendingPostsIndex

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
    engagementCount: integer().notNull().generatedAlwaysAs(
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
    //normalized embedding vector. calculated outside the DB.
    embeddingNormalized: embeddingVector("embedding_normalized"),
    //all kinds of keywords for the post. used for trend tracking. 
    keywords: keyword().notNull().array(),
    //is the post published or not. pending posts need an id to define where their media is uploaded.
    pending: boolean().notNull().default(false),
    //the files those belong to this post.
    media: jsonb().$type<MediaFile[]>(),
    //score based on engagement rate to rank comments
    commentScore: real().notNull().generatedAlwaysAs(
        (): SQL => sql`
        (
            ((${posts.likeCount} + ${posts.replyCount} + ${posts.clickCount} + 10) / (${posts.viewCount} + 10))::float 
            * 
            (${posts.likeCount} + ${posts.replyCount} + ${posts.clickCount})::float
        )`
    ),
    //half day long time buckets. used for filtering date when using the vector index
    timeBucket: integer().notNull().generatedAlwaysAs(
        (): SQL => sql<number>`floor(extract(epoch from ${posts.createdAt})/60/60/12)::int`
    ),
    //indicate if this is a reply
    isReply: boolean().notNull().generatedAlwaysAs((): SQL => isNotNull(posts.replyingTo))
}, (table) => [
    foreignKey({
        columns: [table.replyingTo],
        foreignColumns: [table.id],
        name: "reply_to_post_fkey",
    }).onDelete("cascade"),
    index('replyingToIndex').on(table.replyingTo, table.userId, table.createdAt.desc()),
    index('userContentsIndex').on(table.userId, table.isReply, table.createdAt.desc()),
    index('recentPostsIndex').on(table.createdAt.desc()).where(isNull(table.replyingTo)),
    index('postsKeywordIndex').using("gin", table.keywords).where(isNull(table.replyingTo)),
    index('orderRepliesByScoreIndex').on(table.replyingTo, table.commentScore.desc(), table.createdAt.desc()).where(isNotNull(table.replyingTo)),
    index("recentPostsESimIndex").using("hnsw", table.timeBucket, table.embeddingNormalized.op("vector_l2_ops")),
    index("pendingPostsIndex").on(table.createdAt.asc()).where(eq(table.pending,true))
]);

export type Post = InferSelectModel<typeof posts>;

export type PostToInsert = InferInsertModel<typeof posts>;