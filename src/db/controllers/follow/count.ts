import { eq, SQL } from "drizzle-orm";
import { db } from "../..";
import { follows } from "../../schema/follows";
import { users } from "../../schema/users";

export async function updateFollowCount(userId: string) {
    await updateFollowCounts(eq(users.id, userId))
}

export async function updateFollowCounts(where: SQL | undefined) {
    await db.update(users)
        .set({
            followerCount: db.$count(follows, eq(follows.followedId, users.id))
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating follow count:", error)
        )
}