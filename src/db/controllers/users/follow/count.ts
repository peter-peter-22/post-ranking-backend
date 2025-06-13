import { eq, SQL } from "drizzle-orm";
import { db } from "../../..";
import { follows } from "../../../schema/follows";
import { users } from "../../../schema/users";

/**Recalculate the follower count on the selected users. */
export async function updateFollowerCounts(where: SQL | undefined=undefined) {
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
        console.log("Updated follower counts")
}

/**Recalculate the following count on the selected users. */
export async function updateFollowingCounts(where: SQL | undefined=undefined) {
    await db.update(users)
        .set({
            followingCount: db.$count(follows, eq(follows.followedId, users.id))
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating follow count:", error)
        )
        console.log("Updated following counts")
}