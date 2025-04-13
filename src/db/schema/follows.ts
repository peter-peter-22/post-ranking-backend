import { index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const follows = pgTable('follows', {
    followerId: uuid().notNull().references(() => users.id,{onDelete:"cascade"}),
    followedId: uuid().notNull().references(() => users.id,{onDelete:"cascade"}),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.followerId, t.followedId),
    index().on(t.followedId, t.followerId),// The unique constraint also creates an index, but in the opposite direction
]);

export type Follow = InferSelectModel<typeof follows>;

export type FollowToInsert = InferInsertModel<typeof follows>; 