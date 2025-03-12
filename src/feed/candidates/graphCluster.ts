import { and, desc, eq, notInArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { users } from "../../db/schema/users";
import { minimalEngagement } from "../filters";

/** Max count of posts */
const count = 350;

/** Selecting candidate posts from the graph cluster of the user.
 * @todo The user is added to the post again later.
*/
export async function getGraphClusterCandidates({ user, commonFilters,followedUsers }: CandidateCommonData): Promise<CandidatePost[]> {
    // If the user isn't a member of a cluster, exit.
    if (!user.clusterId) {
        console.log("Graph cluster candidates cancelled.")
        return []
    }

    // Get the posts.
    const candidates = await db
        .select(candidateColumns)
        .from(posts)
        .leftJoin(users, eq(users.clusterId, user.clusterId))
        .where(
            and(
                ...commonFilters,
                minimalEngagement(),
                eq(users.clusterId, user.clusterId),
                notInArray(posts.userId,followedUsers),
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
    console.log(`Graph cluster candidates: ${candidates.length}`)

    // Set the candidate type.
    const candidatesWithType = setCandidatesType(candidates, "GraphClusters")

    return candidatesWithType
}