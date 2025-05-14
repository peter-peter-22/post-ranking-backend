import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

/** The popularity of the keywords per day. */
export const keywordPopularity = pgTable('keyword_popularities', {
    keyword: varchar({ length: 50 }).notNull(),
    posts: integer().notNull(),
    date: timestamp().notNull().defaultNow(),
}, (t) => [
    index().on(t.date.desc()),
    index().on(t.keyword, t.date.desc())
]);

export type KeywordPopularity = InferSelectModel<typeof keywordPopularity>;

export type KeywordPopularityToInsert = InferInsertModel<typeof keywordPopularity>; 