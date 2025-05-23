import { and, asc, cosineDistance, notInArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from "..";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";
import { minimalEngagement } from "../../filters";

/** Max count of posts. */
const count = 500;

/** Selecting candidate posts those embedding is similar to the embedding of the user. 
 * @todo Use a separate embedding vector storage.
 * @todo Over-representation filter.
*/
export function getEmbeddingSimilarityCandidates({ user, commonFilters, followedUsers }: CandidateCommonData) {

    // If the user has no embedding vector, exit.
    if (!user.embedding) {
        console.log(`Embedding similarity candidates cancelled.`)
        return
    }

    // Get the posts.
    return db
        .select(candidateColumns(user, "EmbeddingSimilarity"))
        .from(posts)
        .where(
            and(
                ...commonFilters,
                notInArray(posts.userId, followedUsers),
                minimalEngagement(),
            )
        )
        .orderBy(asc(cosineDistance(posts.embedding, user.embedding)))
        .limit(count)
        .$dynamic()
}