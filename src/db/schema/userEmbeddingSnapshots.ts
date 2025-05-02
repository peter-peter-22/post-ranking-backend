import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { embeddingVector } from '../common';
import { users } from './users';

export const userEmbeddingSnapshots = pgTable('user_embedding_snapshots', {
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    embedding: embeddingVector("embedding").notNull(),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    index().on(t.userId, t.createdAt.desc())
]);

export type UserEmbeddingSnapshot = InferSelectModel<typeof userEmbeddingSnapshots>;

export type UserEmbeddingSnapshotToInsert = InferInsertModel<typeof userEmbeddingSnapshots>; 