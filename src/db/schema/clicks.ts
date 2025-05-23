import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';

/** The clicks of the posts. */
export const clicks = pgTable('clicks', {
    postId: uuid().notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.postId, t.userId),
    index("user_click_history").on(t.userId, t.createdAt.desc().nullsFirst())
]);

export type Click = InferSelectModel<typeof clicks>;

export type ClicksToInsert = InferInsertModel<typeof clicks>; 