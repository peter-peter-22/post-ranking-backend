import { and, cosineDistance, desc, gt, sql } from "drizzle-orm";
import { candidateColumns } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { isPost, minimalEngagement } from "./filters";

/** Max count of posts. */
const count = 450;
/** Posts older than this will be filtered out. 
 * @todo This does nothing when there are less than 450 posts in the last 2 days.
*/
const maxAge = 1000 * 60 * 60 * 24 * 2 // 2 days

/** Selecting candidate posts from the users the  */
export async function getEmbeddingSimilarityCandidates({ user, followedUsers }: { user: User, followedUsers: string[] }) {

    //if the user has no embedding vector, exit.
    if (!user.embedding)
        return []

    /** Posts older than this will be filtered out. */
    const maxAgeDate = new Date(Date.now() - maxAge)

    const similarity = sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})`;
    return await db
        .select({
            ...candidateColumns,
            similarity
        })
        .from(posts)
        .where(
            and(
                gt(posts.createdAt, maxAgeDate),
                minimalEngagement,
                isPost
            )
        )
        .orderBy(t => desc(similarity))
        .limit(count)
}