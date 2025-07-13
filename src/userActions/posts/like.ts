import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { likes } from "../../db/schema/likes";
import { addUpdateJob } from "../../jobs/updates";
import { redisClient } from "../../redis/connect";

export async function likePost(postId: string, userId: string, value: boolean) {
    // Handle changes in the DB
    if (value) await createLike(postId, userId);
    else await deleteLike(postId, userId);
    // Schelude counter update
    await addUpdateJob("likeCount", postId);
}

async function createLike(postId: string, userId: string) {
    // Insert like into the DB
    await db
        .insert(likes)
        .values({ userId, postId })
        .onConflictDoNothing()
    // Increment the like counter in redis
    await redisClient.incr(postLikeCounterRedis(postId))
}

async function deleteLike(postId: string, userId: string) {
    // Delete the like from the DB
    await db
        .delete(likes)
        .where(and(
            eq(likes.userId, userId),
            eq(likes.postId, postId)
        ))
    // Decrement the like counter in redis
    await redisClient.incr(postLikeCounterRedis(postId))
}

export function postLikeCounterRedis(postId: string) {
    return `likeCount/${postId}`
}