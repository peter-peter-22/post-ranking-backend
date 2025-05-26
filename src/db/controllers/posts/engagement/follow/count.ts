import { eq, SQL } from "drizzle-orm";
import { db } from "../../../..";
import { follows } from "../../../../schema_pending/follows";
import { users } from "../../../../schema/users";

/**Recalculate the follow count on the selected users. */
export async function updateFollowCounts(where: SQL | undefined=undefined) {
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
        console.log("Updated follow counts")
}