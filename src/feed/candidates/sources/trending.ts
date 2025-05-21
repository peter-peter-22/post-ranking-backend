import { and, arrayOverlaps, desc, eq } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from "..";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { users } from "../../../db/schema/users";
import { getTrendNames } from "../../../trends/getTrends";

/** Selecting candidate posts from trending topics. */
export async function getTrendCandidates({ user, commonFilters }: CandidateCommonData) {
    // Get the trends.
    const trends = await getTrendNames(user.clusterId)

    // Create subqueries to get the top posts from each trend
    return trends.map(trend => (db
        .select(candidateColumns(user, "Trending"))
        .from(posts)
        .where(and(
            arrayOverlaps(posts.keywords, [trend]),
            ...commonFilters
        ))
        .orderBy(desc(posts.createdAt))
        .limit(20)
    ))
}