import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const follows = pgTable('follows', {
    followerId: uuid().references(() => users.id),
    followedId: uuid().references(() => users.id),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.followerId, t.followedId),
]);