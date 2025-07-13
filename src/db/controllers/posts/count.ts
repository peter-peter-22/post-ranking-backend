import { aliasedTable, eq, SQL } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";

export const postsToUpdate = aliasedTable(posts, "selected_posts")

/**Recalculate the reply count on a post. */
export async function updateReplyCount(postId: string) {
    await db.update(postsToUpdate)
        .set({
            replyCount: db.$count(posts, eq(postsToUpdate.id, posts.replyingTo))
        })
        .where(
            eq(posts.id, postId)
        )
        .catch(
            error => console.error("error while updating reply count:", error)
        )
}