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