import { InferInsertModel } from 'drizzle-orm';
import { pgTable, timestamp } from 'drizzle-orm/pg-core';

export const userVectorUpdates = pgTable('user_vector_updates', {
    timestamp: timestamp().notNull().default(new Date(0)),
});

export type UpdateToInsert = InferInsertModel<typeof userVectorUpdates>; 