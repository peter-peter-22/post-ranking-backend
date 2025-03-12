import { and, cosineDistance, desc, notInArray, sql } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { minimalEngagement } from "../filters";

/** Max count of posts. */
const count = 450;

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

    /** SQL for calculating the similarity. */
    const similarity = sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})`;

    // Get the posts.
    const candidates = await db
        .select({
            ...candidateColumns,
            similarity
        })
        .from(posts)
        .where(
            and(
                ...commonFilters,
                notInArray(posts.userId,followedUsers),
                minimalEngagement(),
            )
        )
        .orderBy(t => desc(t.similarity))
        .limit(count)
    console.log(`Embedding similarity candidates: ${candidates.length}`)

    // Set the candidate type.
    const candidatesWithType=setCandidatesType(candidates,"EmbeddingSimilarity")

    return candidatesWithType
}