import { and, arrayOverlaps, desc } from "drizzle-orm";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";
import { isPost, minimalEngagement, noPending, notDisplayed, recencyFilter } from "../../../filters";
import { candidateColumns } from "../../../common";

/** Selecting candidate posts from trending topics. */
export function getTrendCandidates({ trends, skipIds }: { trends: string[], skipIds?: string[] }) {
    console.log(`Getting post candidates for the following trends: ${trends.join(", ")}`)
    // Create subqueries to get the top posts from each trend
    return trends.map(trend => (db
        .select(candidateColumns("Trending"))
        .from(posts)
        .where(and(
            arrayOverlaps(posts.keywords, [trend]),
            recencyFilter(),
            noPending(),
            isPost(),
            notDisplayed(skipIds),
            minimalEngagement()
        ))
        .orderBy(desc(posts.createdAt))
        .limit(20)
        .$dynamic()
    ))
}