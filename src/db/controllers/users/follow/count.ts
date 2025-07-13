import { eq } from "drizzle-orm";
import { db } from "../../..";
import { userFollowerCountRedis } from "../../../../jobs/followingCount";
import { redisClient } from "../../../../redis/connect";
import { follows } from "../../../schema/follows";
import { users } from "../../../schema/users";

/**Recalculate the follower count of a user. */
export async function updateFollowerCount(userId: string) {
    const [updated] = await db.update(users)
        .set({
            followerCount: db.$count(follows, eq(follows.followedId, users.id))
        })
        .where(
            eq(users.id, userId)
        )
        .returning({ followerCount: users.followerCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(userFollowerCountRedis(userId), updated.followerCount)
}

/**Recalculate the following count of a user. */
export async function updateFollowingCount(userId: string) {
    const [updated] = await db.update(users)
        .set({
            followingCount: db.$count(follows, eq(follows.followerId, users.id))
        })
        .where(
            eq(users.id, userId)
        )
        .returning({ followingCount: users.followingCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(userFollowerCountRedis(userId), updated.followingCount)
}