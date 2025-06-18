import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { follows } from "../db/schema/follows";

/**
 * Make a user follow another
 * @param followerId The initiator of the following
 * @param followedId The followed user
 */
export async function follow(followerId: string, followedId: string) {
    await db.insert(follows)
        .values({
            followedId,
            followerId
        })
        .onConflictDoNothing()
}

/**
 * Delete a follow
 * @param followerId The initiator of the following
 * @param followedId The followed user
 */
export async function unfollow(followerId: string, followedId: string) {
    await db.delete(follows)
        .where(and(
            eq(follows.followerId, followerId),
            eq(follows.followedId, followedId)
        ))
}