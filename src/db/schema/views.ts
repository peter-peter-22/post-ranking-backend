import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';

export const views = pgTable('views', {
    postId: uuid().references(() => posts.id,{onDelete:"cascade"}),
    userId: uuid().references(() => users.id,{onDelete:"cascade"}),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.postId, t.userId),
]);

export type View = InferSelectModel<typeof views>;

export type ViewToInsert = InferInsertModel<typeof views>; 