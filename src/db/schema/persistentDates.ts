import { InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const persistentDates = pgTable('persistent_dates', {
    id: text().notNull().unique().primaryKey(),
    timestamp: timestamp().notNull().default(new Date(0)),
});

export type UpdateToInsert = InferInsertModel<typeof persistentDates>; 