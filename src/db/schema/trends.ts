import { InferInsertModel, InferSelectModel, SQL, sql } from 'drizzle-orm';
import { index, integer, pgTable, real } from 'drizzle-orm/pg-core';
import { keyword } from '../common';

/** The trend scores at the time. */
export const trends = pgTable('trends', {
    keyword: keyword().notNull(),
    growth: real().notNull(),
    postCount: integer().notNull(),
    score: real().generatedAlwaysAs((): SQL => sql`${trends.growth}*${trends.postCount}`).notNull()
}, (t) => [
    index().on(t.score.desc())
]);

export type Trend = InferSelectModel<typeof trends>;

export type TrendToInsert = InferInsertModel<typeof trends>; 