import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, real, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';

/** The trend scores at the time. */
export const trends = pgTable('trends', {
    name: varchar({ length: 50 }).notNull(),
    score: real().notNull(),
    embedding: embeddingVector("embedding").notNull(),
});

export type Trend = InferSelectModel<typeof trends>;

export type TrendToInsert = InferInsertModel<typeof trends>; 