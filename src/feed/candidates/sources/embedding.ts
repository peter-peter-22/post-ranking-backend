import { and, asc, cosineDistance, notInArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from "..";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { minimalEngagement } from "../../filters";

/** Max count of posts. */
const count = 500;

/** Selecting candidate posts those embedding is similar to the embedding of the user. 
 * @todo Use a separate embedding vector storage.
 * @todo Over-representation filter.
*/
export async function getEmbeddingSimilarityCandidates({ user, commonFilters,followedUsers }: CandidateCommonData): Promise<CandidatePost[]> {

    // If the user has no embedding vector, exit.
    if (!user.embedding) {
        console.log(`Embedding similarity candidates cancelled.`)
        return []
    }

    // Get the posts.
    const candidates = await db
        .select(candidateColumns(user))
        .from(posts)
        .where(
            and(
                ...commonFilters,
                notInArray(posts.userId,followedUsers),
                minimalEngagement(),
            )
        )
        .orderBy(asc(cosineDistance(posts.embedding, user.embedding)))
        .limit(count)
    console.log(`Embedding similarity candidates: ${candidates.length}`)

    // Set the candidate type.
    const candidatesWithType=setCandidatesType(candidates,"EmbeddingSimilarity")

    return candidatesWithType
}