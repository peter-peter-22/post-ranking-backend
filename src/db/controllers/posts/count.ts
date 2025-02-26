import { aliasedTable, eq, SQL } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";

export async function updateReplyCount(postId: string) {
    await updateReplyCounts(eq(posts.id, postId))
}

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