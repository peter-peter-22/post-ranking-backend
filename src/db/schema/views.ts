import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';

/** The views of the posts. */
export const views = pgTable('views', {
    postId: uuid().notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.postId, t.userId),
    index("user_view_history").on(t.userId, t.createdAt.desc())
]);

export type View = InferSelectModel<typeof views>;

export type ViewToInsert = InferInsertModel<typeof views>; 