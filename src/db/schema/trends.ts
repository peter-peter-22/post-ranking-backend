import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, real, varchar } from 'drizzle-orm/pg-core';

export const trends = pgTable('trends', {
    name: varchar({ length: 50 }).notNull(),
    posts: integer().notNull(),
    score: real().notNull()
});

export type Trend = InferSelectModel<typeof trends>;

export type TrendToInsert = InferInsertModel<typeof trends>; 