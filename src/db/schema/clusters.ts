import { integer, pgTable } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';

export const clusters = pgTable('clusters', {
    id: integer().notNull().unique(),// The id is assigned by the cluster generator
    centroid: embeddingVector("centroid").notNull()
});