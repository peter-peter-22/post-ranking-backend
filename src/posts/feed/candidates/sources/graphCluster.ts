import { and, desc, eq, notInArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from "..";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";
import { users } from "../../../../db/schema/users";
import { minimalEngagement } from "../../filters";

/** Max count of posts */
const count = 500;

/** Selecting candidate posts from the graph cluster of the user.
 * @todo The user is added to the posts again later.
*/
export function getGraphClusterCandidates({ user, commonFilters, followedUsers }: CandidateCommonData) {
    // If the user isn't a member of a cluster, exit.
    if (!user.clusterId) {
        console.log("Graph cluster candidates cancelled.")
        return
    }

    // Get the posts.
    return db
        .select(candidateColumns(user, "GraphClusters"))
        .from(posts)
        .where(
            and(
                ...commonFilters,
                minimalEngagement(),
                eq(users.clusterId, user.clusterId),
                notInArray(posts.userId, followedUsers),
            )
        )
        .innerJoin(users, eq(users.id, posts.userId))
        .orderBy(desc(posts.createdAt))
        .limit(count)
}