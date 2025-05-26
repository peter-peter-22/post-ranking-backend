import { eq, SQL } from "drizzle-orm";
import { db } from "../../../..";
import { likes } from "../../../../schema_pending/likes";
import { posts } from "../../../../schema/posts";

/**Recalculate the like count on the selected posts. */
export async function updateLikeCounts(where: SQL | undefined=undefined) {
    await db.update(posts)
        .set({
            likeCount: db.$count(likes, eq(posts.id, likes.postId)),
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating like count:", error)
        )
}