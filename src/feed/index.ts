import { and, desc, eq, getTableColumns, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { follows } from "../db/schema/follows";
import { likes } from "../db/schema/likes";
import { posts } from "../db/schema/posts";
import { User, users } from "../db/schema/users";

/** Get posts from the main feed of a user. */
export async function getFeed({ user, limit = 50, offset = 0 }: { user: User, limit?: number, offset?: number }) {
    return await db.select({
        ...getTableColumns(posts),
        user: getTableColumns(users),
        score: sql<number>`(
            ${posts.likeCount}
            +
            ${posts.replyCount} * 5
            + 
            EXTRACT(EPOCH FROM (${posts.createdAt})) / ${3600} - ${480000}
            +
            CASE WHEN ${isNotNull(follows)} THEN ${200} ELSE 0 END
        )`.as('score'),
        likedByUser: isNotNull(likes),
        followedByUser: isNotNull(follows)
    })
        .from(posts)
        .where(isNull(posts.replyingTo))
        .orderBy(desc(sql`score`))
        .leftJoin(likes, and(eq(posts.id, likes.postId), eq(likes.userId, user.id)))
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(follows, and(eq(follows.followedId, posts.userId), eq(follows.followerId, user.id)))
        .limit(limit)
        .offset(offset);
}

/** The posts from the main feed of a user in a more readable format.  */
export async function getFeedSimplified({ user }: { user: User }) {
    return (await getFeed({ user })).map(({ likedByUser, followedByUser, likeCount, user: publisher, score, topic, viewCount, createdAt, clickCount }) => ({
        handle: publisher?.handle,
        topic,
        score,
        createdAt: createdAt.getDay(),
        counts: {
            likeCount,
            clickCount,
            viewCount,
        },
        personal: {
            followedByUser,
            likedByUser
        }
    }))
}