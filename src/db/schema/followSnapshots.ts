import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const followSnapshots = pgTable('follow_snapshots', {
    followerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    followedId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    isFollowing: boolean().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    unique().on(t.followerId, t.followedId),
    index().on(t.followerId,t.followedId,t.createdAt)
]);

export type FollowShapshot = InferSelectModel<typeof followSnapshots>;

export type FollowShapshotToInsert = InferInsertModel<typeof followSnapshots>; 