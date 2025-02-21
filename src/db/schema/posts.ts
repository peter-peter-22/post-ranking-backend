import { pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
    id: uuid().defaultRandom(),
    userId: uuid().references(() => users.id),
    text: text().notNull(),
    createdAt: timestamp().defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.userId, table.id] }),
]);