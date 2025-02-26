import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm';
import { check, foreignKey, integer, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().notNull().references(() => users.id),
    text: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    likeCount: integer().notNull().default(0),
    topic: varchar({ length: 50 }),//the topic that the bots see on the posts. 
    engaging: real().notNull().default(0),//the engagement modifier that decides how much the bots engage with the post. 0-1
    replyingTo: uuid(),
    replyCount: integer().notNull().default(0),
}, (table) => [
    check("engaging clamp", sql`${table.engaging} >= 0 AND ${table.engaging} <= 1`),
    foreignKey({
        columns: [table.replyingTo],
        foreignColumns: [table.id],
        name: "contracts_underlying_id_fkey",
    }),
]);

export type Post = InferSelectModel<typeof posts>;

export type PostToInsert = InferInsertModel<typeof posts>; 