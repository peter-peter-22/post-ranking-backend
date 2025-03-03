import { aliasedTable, eq, SQL } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";

/**Recalculate the reply count on the selected posts. */
export async function updateReplyCounts(where: SQL | undefined = undefined) {
    const selectedPosts = aliasedTable(posts, "comments")
    await db.update(selectedPosts)
        .set({
            replyCount: db.$count(posts, eq(selectedPosts.id, posts.replyingTo))
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating reply count:", error)
        )
}