import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { posts } from "../db/schema/posts";
import { userClusterTrends } from "../db/schema/userClusterTrends";
import { users } from "../db/schema/users";
import { isPost, recencyFilter } from "../posts/filters";

export async function updateClusterTrends() {
    /** The minimum posts of a keyword in a cluster to be counter as trend. */
    const minPostCount = 5;

    const clusterKeywords = db
        .select({
            clusterId: users.clusterId,
            keyword: sql<string>`unnest(${posts.keywords})`.as("cluster_keyword"),
        })
        .from(posts)
        .leftJoin(users, eq(users.id, posts.userId))
        .where(and(
            isPost(),
            recencyFilter()
        ))
        .as("cluster_keywords")

    const clusterKeywordMentions = db
        .select({
            keyword: clusterKeywords.keyword,
            clusterId: clusterKeywords.clusterId,
            count: count().as("keyword_count_in_cluster")
        })
        .from(clusterKeywords)
        .groupBy(clusterKeywords.clusterId, clusterKeywords.keyword)
        .as("cluster_keyword_mentions")

    await db
        .insert(userClusterTrends)
        .select(db
            .select({
                keyword: clusterKeywordMentions.keyword,
                clusterId: clusterKeywordMentions.clusterId,
                count:clusterKeywordMentions.count
            })
            .from(clusterKeywordMentions)
            .where(gte(clusterKeywordMentions.count, minPostCount))
        )
}