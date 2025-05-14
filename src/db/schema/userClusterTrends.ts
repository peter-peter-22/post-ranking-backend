import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, unique } from 'drizzle-orm/pg-core';
import { keyword } from '../common';
import { clusters } from './clusters';

/** The top trends in the user clusers. Used for getting personalized trends. */
export const userClusterTrends = pgTable('user_cluster_trends', {
    keyword: keyword().notNull(),
    clusterId: integer().references(() => clusters.id, { onDelete: "cascade" }),
    count: integer().notNull(),
}, (t) => [
    unique().on(t.clusterId, t.keyword),
    index().on(t.keyword,t.count)
]);

export type userClusterTrend = InferSelectModel<typeof userClusterTrends>;

export type userClusterTrendToInsert = InferInsertModel<typeof userClusterTrends>;