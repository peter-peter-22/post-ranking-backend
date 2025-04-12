import { and, arrayOverlaps, desc } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from "..";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { getTrendNames } from "../../../trends/getTrends";

/** Max posts per trend. */
const postsPerTrend = 5

/** Selecting candidate posts from trending topics. 
 * @todo This approach limits how much posts can be displayed for a new user.
*/
export async function getTrendCandidates({ commonFilters }: CandidateCommonData): Promise<CandidatePost[]> {
    // Get the trends.
    const trends = await getTrendNames()

    // Get the posts.
    let candidates = (
        await Promise.all(
            // Select the best posts from each trend.
            trends.map(trend => (
                db
                    .select(candidateColumns)
                    .from(posts)
                    .where(and(
                        arrayOverlaps(posts.hashtags, [trend]),
                        ...commonFilters
                    ))
                    .orderBy(desc(posts.engagementScore))
                    .limit(postsPerTrend)
            ))
        )
    ).flat()
    console.log(`Trending candidates: ${candidates.length}`)

    // Set the candidate type.
    const candidatesWithType = setCandidatesType(candidates, "Trending")

    return candidatesWithType
}