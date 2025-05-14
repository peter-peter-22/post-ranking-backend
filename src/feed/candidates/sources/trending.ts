import { and, arrayOverlaps, desc } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from "..";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { getTrendNames } from "../../../trends/getTrends";

/** Selecting candidate posts from trending topics. 
 * @todo This approach limits how much posts can be displayed for a new user.
*/
export async function getTrendCandidates({ user, commonFilters }: CandidateCommonData): Promise<CandidatePost[]> {
    // Get the trends.
    const trends = await getTrendNames()

    // Get the posts.
    let candidates = (
        await Promise.all(
            // Select the most recent posts from each trend.
            trends.map(trend => (
                db
                    .select(candidateColumns(user))
                    .from(posts)
                    .where(and(
                        arrayOverlaps(posts.keywords, [trend]),
                        ...commonFilters
                    ))
                    .orderBy(desc(posts.createdAt))
                    .limit(20)
            ))
        )
    ).flat()
    console.log(`Trending candidates: ${candidates.length}`)

    // Set the candidate type.
    const candidatesWithType = setCandidatesType(candidates, "Trending")

    return candidatesWithType
}