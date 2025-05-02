import { desc, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const engagementHistorySnapshots = pgTable('engagement_history_snapshots', {
    viewerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    posterId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    likeCount:integer().notNull().default(0),
    replyCount:integer().notNull().default(0),
    clickCount:integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    index().on(t.viewerId, t.posterId,t.createdAt.desc())
]);

export type EngagementHistoryShapshot = InferSelectModel<typeof engagementHistorySnapshots>;

export type EngagementHistoryShapshotToInsert = InferInsertModel<typeof engagementHistorySnapshots>;