import { eq, inArray } from "drizzle-orm";
import { db } from "../..";
import { likes } from "../../schema/likes";
import { posts } from "../../schema/posts";

export async function updateLikeCount(postId: string) {
    await db.update(posts)
        .set({
            likeCount: db.$count(posts, eq(posts.id, likes.postId))
        })
        .where(
            eq(posts.id, postId)
        )
}

export async function updateLikeCounts(postIds: string[]) {
    await db.update(posts)
        .set({
            likeCount: db.$count(likes, eq(posts.id, likes.postId))
        })
        .where(
            inArray(posts.id, postIds)
        )
}