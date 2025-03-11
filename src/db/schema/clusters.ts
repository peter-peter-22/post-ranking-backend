import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable } from 'drizzle-orm/pg-core';

export const clusters = pgTable('clusters', {
    id: integer().notNull().unique(),// The id is assigned by the cluster generator
});

export type Cluster = InferSelectModel<typeof clusters>;