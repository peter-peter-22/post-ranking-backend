import { and, asc, inArray, l2Distance, lt } from "drizzle-orm";
import { db } from "../../../db";
import { getTimeBuckets } from "../../../db/controllers/posts/timeBuckets";
import { posts } from "../../../db/schema/posts";
import { Vector } from "../../../embedding/updateUserEmbedding";
import { candidateColumns } from "../../common";
import { maxAge, minimalEngagement, notDisplayed } from "../../filters";

/** Max count of posts. */
const count = 500;
/** Maximum l2 distance of the selected posts */
const maxDistance = 0.5

/** Selecting candidate posts those embedding is similar to a provided vector, with a minimum threshold. */
export async function getPostEmbeddingSimilarityCandidates(embedding: Vector, skipIds?: string[] ) {
    // Get time buckets
    const timeBuckets = getTimeBuckets(maxAge(), new Date(), false, true)
    console.log(`Selecting embedding similarity candidates from the following time buckets: ${timeBuckets.join(', ')}`)

    // Select the recent relevant posts.
    const relevantPostsUnfiltered = db.$with("posts").as(
        db
            .select()
            .from(posts)
            .where(
                inArray(posts.timeBucket, timeBuckets)
            )
            .orderBy(asc(l2Distance(posts.embeddingNormalized, embedding)))
            .limit(count + (skipIds?.length || 0)) // Any additional filter breaks the index, so the number of the selected rows in increased here, then filtered later
    )

    // Filter the selected posts.
    return db
        .with(relevantPostsUnfiltered)
        .select(candidateColumns("EmbeddingSimilarity"))
        .from(relevantPostsUnfiltered)
        .where(
            and(
                notDisplayed(skipIds),
                minimalEngagement(),
                lt(l2Distance(posts.embeddingNormalized, embedding), maxDistance)
            )
        )
        .$dynamic()
}