import { InferInsertModel, InferSelectModel, SQL, sql } from 'drizzle-orm';
import { integer, pgTable, real, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';

/** The trend scores at the time. */
export const trends = pgTable('trends', {
    keyword: varchar({ length: 50 }).notNull(),
    growth: real().notNull(),
    postCount: integer().notNull(),
    score: real().generatedAlwaysAs((): SQL => sql`${trends.growth}*${trends.postCount}`)
    //embedding: embeddingVector("embedding").notNull(),
});

export type Trend = InferSelectModel<typeof trends>;

export type TrendToInsert = InferInsertModel<typeof trends>; 