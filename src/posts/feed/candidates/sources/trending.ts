import { and, arrayOverlaps, desc } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from "..";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";

/** Selecting candidate posts from trending topics. */
export function getTrendCandidates({ user, commonFilters }: CandidateCommonData,trends:string[]) {
    console.log(`Getting post candidates for the following trends: ${trends.join(", ")}`)
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