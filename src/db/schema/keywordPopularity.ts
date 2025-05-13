import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

/** The popularity of the keywords per day. */
export const keywordPopularity = pgTable('keyword_popularities', {
    name: varchar({ length: 50 }).notNull(),
    posts: integer().notNull(),
    date: timestamp().notNull().defaultNow(),
});

export type KeywordPopularity = InferSelectModel<typeof keywordPopularity>;

export type KeywordPopularityToInsert = InferInsertModel<typeof keywordPopularity>; 