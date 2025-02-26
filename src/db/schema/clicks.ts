import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';

export const clicks = pgTable('clicks', {
    postId: uuid().references(() => posts.id),
    userId: uuid().references(() => users.id),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.postId, t.userId),
]);

export type Click = InferSelectModel<typeof clicks>;

export type ClicksToInsert = InferInsertModel<typeof clicks>; 