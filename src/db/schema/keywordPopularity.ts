import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { keyword } from '../common';

/** The popularity of the keywords per day. */
export const keywordPopularity = pgTable('keyword_popularities', {
    keyword: keyword().notNull().primaryKey(),
    posts: integer().notNull(),
    date: timestamp().notNull().defaultNow(),
}, (t) => [
    index().on(t.date.desc().nullsFirst()),
    index().on(t.keyword, t.date.desc().nullsFirst())
]);

export type KeywordPopularity = InferSelectModel<typeof keywordPopularity>;

export type KeywordPopularityToInsert = InferInsertModel<typeof keywordPopularity>; 