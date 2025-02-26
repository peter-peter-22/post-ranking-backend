import { eq, SQL } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";
import { views } from "../../schema/views";

/**Recalculate the view count on a post. */
export async function updateViewCount(postId: string) {
    await updateViewCounts(eq(posts.id, postId))
}

/**Recalculate the view count on the selected posts. */
export async function updateViewCounts(where: SQL | undefined = undefined) {
    await db.update(posts)
        .set({
            viewCount: db.$count(views, eq(posts.id, views.postId))
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating view count:", error)
        )
}