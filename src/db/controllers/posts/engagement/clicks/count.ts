import { eq, SQL } from "drizzle-orm";
import { db } from "../../../..";
import { clicks } from "../../../../schema_pending/clicks";
import { posts } from "../../../../schema/posts";

/**Recalculate the click count on the selected posts. */
export async function updateClickCounts(where: SQL | undefined = undefined) {
    await db.update(posts)
        .set({
            clickCount: db.$count(clicks, eq(posts.id, clicks.postId))
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating click count:", error)
        )
}