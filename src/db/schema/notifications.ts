import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationTypeEnum = pgEnum('notification_type', [
    'like',
    'reply',
    'mention',
    'follow',
]);

/** The notifications of the users. */
export const notifications = pgTable('notifications', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum().notNull(),
    data: jsonb(),
    createdAt: timestamp().notNull().defaultNow(),
    // Unread notifications with the same key are merged.
    key: varchar({ length: 100 }).notNull()
}, (t) => [
    index("recent_notifications_of_user_idx").on(t.userId, t.createdAt.desc()),
    index("unread_notification_deduplication_idx").on(t.userId,t.key, t.createdAt.desc()),
    index("notification_cleanup_index").on(t.createdAt.asc())
]);

export type Notification = InferSelectModel<typeof notifications>;

export type NotificationToInsert = InferInsertModel<typeof notifications>; 