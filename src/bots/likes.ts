import { and, desc, eq, not, sql } from "drizzle-orm";
import { db } from "../db";
import { likes, LikeToInsert } from "../db/schema/likes";
import { posts } from "../db/schema/posts";
import type { User } from "../db/schema/users";

/**
 * Make a user like the posts of a specified user those are not liked yet.
 * @param liker The user who casts the likes.
 * @param liked The user who recieves the likes.
 * @param chance How much of the unliked posts will be liked. 1=max
 */
export async function likeUser({ liker, liked, coverage = 1 }: { liker: User, liked: User, coverage?: number }) {
    const unlikedPosts = await db.select()
        .from(posts)
        .leftJoin(likes, and(eq(posts.id, likes.postId), eq(likes.userId, liker.id)))
        .where(
            and(
                eq(posts.userId, liked.id),
                not(
                    sql`
                    EXISTS (
                        SELECT 1 
                        FROM ${likes} 
                        WHERE ${likes.postId} = ${posts.id} 
                        AND ${likes.userId} = ${liker.id}
                    )`
                )
            )
        )
        .orderBy(desc(posts.createdAt))

    if (unlikedPosts.length === 0)
        return console.log("No posts to like")

    const postToLike = Math.round(unlikedPosts.length * coverage)

    const likesToInsert: LikeToInsert[] = Array({ length: postToLike }).map((_, i) => ({
        postId: unlikedPosts[i].posts.id,
        userId: liker.id
    }))

    await db.insert(likes).values(likesToInsert)

    console.log(`Inserted ${likesToInsert.length} likes to "${liked.handle}" from "${liker.handle}"`)
}