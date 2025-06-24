import { and, desc, eq, notInArray } from "drizzle-orm";
import { candidateColumns } from "../../common";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { isPost, minimalEngagement, noPending, notDisplayed, recencyFilter } from "../../filters";
import { User, users } from "../../../db/schema/users";

/** Max count of posts */
const count = 500;

/** Selecting candidate posts from the graph cluster of the user.
 * @todo The user is added to the posts again later.
*/
export function getGraphClusterCandidates({ user, followedUsers,skipIds }: {user:User, followedUsers: string[], skipIds?: string[] }) {
    // If the user isn't a member of a cluster, exit.
    if (!user.clusterId) {
        console.log("Graph cluster candidates cancelled.")
        return
    }

    // Get the posts.
    return db
        .select(candidateColumns( "GraphClusters"))
        .from(posts)
        .where(
            and(
                isPost(),
                minimalEngagement(),
                recencyFilter(),
                noPending(),
                notDisplayed(skipIds),
                eq(users.clusterId, user.clusterId),
                notInArray(posts.userId, followedUsers),
            )
        )
        .innerJoin(users, eq(users.id, posts.userId))
        .orderBy(desc(posts.createdAt))
        .limit(count)
        .$dynamic()
}