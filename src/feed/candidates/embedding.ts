import { and, cosineDistance, desc, gt, sql } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { isPost, minimalEngagement, recencyFilter } from "./filters";

/** Max count of posts. */
const count = 450;

/** Posts least similar than this will be fitlered. */
const minSimilarity = 0.5

/** Selecting candidate posts from the users the  */
export async function getEmbeddingSimilarityCandidates({ user }: CandidateCommonData): Promise<CandidatePost[]> {

    //if the user has no embedding vector, exit.
    if (!user.embedding) {
        console.log(`Embedding similarity candidates cancelled.`)
        return []
    }

    const similarity = sql<number>`1 - (${cosineDistance(posts.embedding, user.embedding)})`;
    const candidates = await db
        .select({
            ...candidateColumns,
            similarity
        })
        .from(posts)
        .where(
            t => and(
                isPost(),
                recencyFilter(),
                minimalEngagement(),
                gt(t.similarity, minSimilarity)
            )
        )
        .orderBy(t => desc(t.similarity))
        .limit(count)

    console.log(`Embedding similarity candidates: ${candidates.length}`)
    return candidates
}