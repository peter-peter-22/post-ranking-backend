import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const follows = pgTable('follows', {
    followerId: uuid().references(() => users.id),
    followedId: uuid().references(() => users.id),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.followerId, t.followedId),
]);

export type Follow = InferSelectModel<typeof follows>;

export type FollowToInsert = InferInsertModel<typeof follows>; 