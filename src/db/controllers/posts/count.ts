import { aliasedTable, eq, SQL } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";

export const postsToUpdate = aliasedTable(posts, "selected_posts")

/**Recalculate the reply count on the selected posts. */
export async function updateReplyCounts(where: SQL | undefined = undefined) {
    await db.update(postsToUpdate)
        .set({
            replyCount: db.$count(posts, eq(postsToUpdate.id, posts.replyingTo))
        })
        .where(
            where
        )
        .catch(
            error => console.error("error while updating reply count:", error)
        )
}