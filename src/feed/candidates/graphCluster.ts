import { and, desc, eq, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost } from ".";
import { db } from "../../db";
import { getIndirectFollowedUsers } from "../../db/controllers/users/getIndirectFollowers";
import { posts } from "../../db/schema/posts";
import { isPost, minimalEngagement, recencyFilter } from "./filters";
import { users } from "../../db/schema/users";

/** Max count of posts */
const count = 350;

/** Selecting candidate posts from the graph cluster of the user.
 * @todo The user is added to the post again later.
*/
export async function getGraphClusterCandidates({ user, followedUsers }: CandidateCommonData): Promise<CandidatePost[]> {
    const indirectlyFollowedUsers = await getIndirectFollowedUsers({ user, followedUsers })

    // If the user isn't a member of a cluster, exit.
    if(!user.clusterId)
    {
        console.log("Graph cluster candidates cancelled.")
        return []
    }

    const candidates = await db
        .select(candidateColumns)
        .from(posts)
        .leftJoin(users,eq(users.clusterId,user.clusterId))
        .where(
            and(
                isPost(),
                recencyFilter(),
                minimalEngagement(),
                inArray(posts.userId, indirectlyFollowedUsers),
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
    console.log(`Graph cluster candidates: ${candidates.length}`)
    return candidates
}