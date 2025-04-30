import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';

export const postSnapshots = pgTable('likes', {
    postId: uuid().notNull().references(() => posts.id,{onDelete:"cascade"}),
    likeCount:integer().notNull().default(0),
    replyCount:integer().notNull().default(0),
    clickCount:integer().notNull().default(0),
    viewCount:integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    index().on(t.postId)
]);

export type PostSnapshot = InferSelectModel<typeof postSnapshots>;

export type PostSnapshotToInsert = InferInsertModel<typeof postSnapshots>; 