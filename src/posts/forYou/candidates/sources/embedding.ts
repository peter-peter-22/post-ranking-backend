import { and, asc, desc, inArray, l2Distance } from "drizzle-orm";
import { db } from "../../../../db";
import { getTimeBuckets } from "../../../../db/controllers/posts/timeBuckets";
import { posts } from "../../../../db/schema/posts";
import { Vector } from "../../../../embedding/updateUserEmbedding";
import { candidateColumns } from "../../../common";
import { maxAge, minimalEngagement, notDisplayed } from "../../../filters";

/** Max count of posts. */
const count = 500;

/** Selecting candidate posts those embedding is similar to a provided vector. */
export async function getEmbeddingSimilarityCandidates({ vector, skipIds }: { vector: Vector, skipIds?: string[] }) {
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
            .orderBy(asc(l2Distance(posts.embedding, vector)))
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
                minimalEngagement()
            )
        )
        .$dynamic()
}