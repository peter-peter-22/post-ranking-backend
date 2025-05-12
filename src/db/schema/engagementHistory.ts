import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/** Engagement histories between the users. */
export const engagementHistory = pgTable('engagement_history', {
    likes: integer().notNull().default(0),
    replies: integer().notNull().default(0),
    clicks: integer().notNull().default(0),
    viewerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    publisherId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
}, (t) => [
    unique().on(t.viewerId, t.publisherId),
]);

export type EngagementHistory = InferSelectModel<typeof engagementHistory>;

export type EngagementHistoryToInsert = InferInsertModel<typeof engagementHistory>; 