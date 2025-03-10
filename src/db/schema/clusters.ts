import { integer, pgTable } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';
import { InferSelectModel } from 'drizzle-orm';

export const clusters = pgTable('clusters', {
    id: integer().notNull().unique(),// The id is assigned by the cluster generator
    centroid: embeddingVector("centroid").notNull()
});

export type Cluster = InferSelectModel<typeof clusters>;