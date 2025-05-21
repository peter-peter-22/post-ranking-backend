import { and, asc, cosineDistance, gt, lt } from "drizzle-orm";
import { RelevantPostsCandidateCommonData } from "..";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { candidateColumns } from "../../feed/candidates";

/** Max count of posts. */
const count = 500;
/** Maximum cosine distance of the selected posts */
const maxDistance = 0.2

/** Selecting candidate posts those embedding is similar to the embedding of the user, with a minimum threshold. 
 * @todo Use a separate embedding vector storage.
 * @todo Over-representation filter.
*/
export function getPostEmbeddingSimilarityCandidates({ user, commonFilters, post }: RelevantPostsCandidateCommonData) {

    // If no embedding vector, exit.
    if (!post.embedding) {
        console.log(`Embedding similarity candidates cancelled.`)
        return
    }

    // Get the post similar posts to the provided vector with a minimum threshold.
    return db
        .select(candidateColumns(user, "EmbeddingSimilarity"))
        .from(posts)
        .where(
            and(
                ...commonFilters,
                // Minimal similarity
                lt(cosineDistance(posts.embedding, post.embedding), maxDistance)
            )
        )
        .orderBy(asc(cosineDistance(posts.embedding, post.embedding)))
        .limit(count)
}