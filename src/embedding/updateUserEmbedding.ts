import { and, desc, eq, getTableColumns, gte, isNotNull, isNull, max, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { db } from "../db";
import { scorePerClick, scorePerLike, scorePerReply } from "../feed";
import { clicks } from "../db/schema/clicks";
import { likes } from "../db/schema/likes";
import { posts } from "../db/schema/posts";
import { User, users } from "../db/schema/users";
import { userVectorUpdates } from "../db/schema/userVectorUpdates";
import { views } from "../db/schema/views";

type WeightedVector = {
    embedding: number[],
    weight: number
}

/** Update the embedding vectors of the users those have any activity since the last update. */
export async function updateUserEmbeddings() {
    console.log("Updating user embeddings.")

    // Get the date of the last update.
    const lastUpdate = await getLastUpdateTimestamp()

    /** Select the users those need update.
     ** To simplify it, all users who seen at least one post since the last update will be selected.
    */
    const usersToUpdate = await db
        .selectDistinctOn([views.userId], getTableColumns(users))
        .from(views)
        .where(gte(views.createdAt, lastUpdate))
        .innerJoin(users, eq(users.id, views.userId))

    // Calculate the average embedding vectors based on engagement history and update users.
    await Promise.all([
        usersToUpdate.map(updateUserEmbeddingVector)
    ])

    // Update the date of the last update.
    //await refreshLastUpdateTimestamp()

    console.log(`Updated ${usersToUpdate.length} user embeddings.`)
}

/** Update the embedding vector of a user. 
 * @param user The user to update.
*/
export async function updateUserEmbeddingVector(user: User) {
    // Get the vectors and their weights.
    const weightedVectors = await getEngagementEmbeddingVectors(user)

    //if the used did not made any engagement yet, exit
    if (weightedVectors.length === 0)
        return

    // Calculate the average.
    const averageVector = calculateWeightedVectorsAverage(weightedVectors)

    // Update the vector of the user.
    await db.update(users).set({ embedding: averageVector }).where(eq(users.id, user.id))
}

/** Calculate the average of an array of vector and weight pairs.
 * @param vectors The vector weight pairs.
 * @returns The average vector.
 */
function calculateWeightedVectorsAverage(vectors: WeightedVector[]) {
    // Calculate the total weight of the rows.
    const totalWeight = vectors.reduce((sum, row) => sum + row.weight, 0)

    // Calculate the weighted average of the rows.
    return vectors[0].embedding.map((_, i) =>
        vectors.reduce((sum, row) => sum + row.embedding[i] * row.weight, 0) / totalWeight
    );
}

/** Get the embedding vectors from the posts those the user recently interacted with.
 * The weight parameter of the vector indicates the type of engagement.
 * @param user The processed user.
 * @returns Array of embedding vectors and weights.
 */
async function getEngagementEmbeddingVectors(user: User): Promise<WeightedVector[]> {
    /** The max count of total engagements those affect the embedding vector. */
    const maxHistory = 1000;

    /** Select unique replied post ids. */
    const recentReplies = db
        .select({
            postId: sql<string>`${posts.replyingTo}::UUID`.as("postId"),
            timestamp: sql<Date>`${max(posts.createdAt)}::TIMESTAMP`.as("createdAt"),
            weight: sql<number>`${scorePerReply}::INT`.as("weight")
        })
        .from(posts)
        .where(and(eq(posts.userId, user.id), isNotNull(posts.replyingTo)))
        .groupBy(posts.replyingTo)
        .orderBy(desc(sql`"createdAt"`))
        .limit(maxHistory)

    /** Select the liked post ids */
    const recentLikes = db
        .select({
            postId: likes.postId,
            timestamp: likes.createdAt,
            weight: sql<number>`${scorePerLike}::INT`.as("weight")
        })
        .from(likes)
        .where(eq(likes.userId, user.id))
        .orderBy(desc(likes.createdAt))
        .limit(maxHistory)

    /** Select the clicked post ids */
    const recentClicks = db
        .select({
            postId: clicks.postId,
            timestamp: clicks.createdAt,
            weight: sql<number>`${scorePerClick}::INT`.as("weight")
        })
        .from(clicks)
        .where(eq(clicks.userId, user.id))
        .orderBy(desc(clicks.createdAt))
        .limit(maxHistory)

    /** With query to get all recent activities ordered by date. */
    const engagedPostIds = db.$with("engaged_posts").as(
        unionAll(
            recentLikes,
            recentReplies,
            recentClicks
        )
            .orderBy(sql`"createdAt"`)
            .limit(maxHistory)
    )

    /** Get the embedding vectors from the posts with the chosen ids. */
    return await db
        .with(engagedPostIds)
        .select({
            embedding: posts.embedding,
            weight: engagedPostIds.weight
        })
        .from(engagedPostIds)
        .innerJoin(posts, eq(posts.id, engagedPostIds.postId))
        .where(isNull(posts.replyingTo))//filter out replies
}

/** Get the date of the last user vector update.
 *@returns The last date when the user vectors were updated.
 */
async function getLastUpdateTimestamp() {
    //try to get the update timestamp from the database
    const [lastUpdate] = await db.select().from(userVectorUpdates)

    //if exists, return date
    if (lastUpdate)
        return lastUpdate.timestamp;

    //if doesn't exists insert a new row with a very old date then return it
    const [update] = await db.insert(userVectorUpdates).values([{ timestamp: new Date(0) }]).returning()
    return update.timestamp;
}

async function refreshLastUpdateTimestamp() {
    await db.update(userVectorUpdates).set({ timestamp: new Date() })
}