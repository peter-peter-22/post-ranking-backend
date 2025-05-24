import { index, pgTable, primaryKey, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

/** Follows between the users. */
export const follows = pgTable('follows', {
    followerId: uuid().notNull().references(() => users.id,{onDelete:"cascade"}),
    followedId: uuid().notNull().references(() => users.id,{onDelete:"cascade"}),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.followerId,t.followedId] }),
    index().on(t.followedId, t.followerId),
]);

export type Follow = InferSelectModel<typeof follows>;

export type FollowToInsert = InferInsertModel<typeof follows>; 