import { aliasedTable, and, desc, eq, exists, getTableColumns, inArray, isNotNull, isNull, like, sql } from "drizzle-orm";
import { db } from "../db";
import { follows } from "../db/schema/follows";
import { likes } from "../db/schema/likes";
import { posts } from "../db/schema/posts";
import { User, users } from "../db/schema/users";

export const scorePerClick = 1
export const scorePerLike = 3
export const scorePerReply = 6

/** Get posts from the out-of-network feed of a user. */
export async function getGlobalFeed({ user, limit = 50, offset = 0 }: { user: User, limit?: number, offset?: number }) {

    const followedByUser = aliasedTable(follows, "followed_by_user")

    const followeds = db.$with('followeds').as(
        db.select({
            id: follows.followedId,
        })
            .from(follows)
            .where(eq(follows.followerId, user.id))
    );

    return await db
        .with(followeds)
        .select({
            ...getTableColumns(posts),
            user: {
                ...getTableColumns(users),
                followedByUser: isNotNull(followedByUser),
                followedIndirectly: exists(db.select().from(follows).where(eq(follows.followerId, posts.userId)))
            },
            likedByUser: isNotNull(likes),
        })
        .from(posts)
        .where(
            and(
                isNull(posts.replyingTo),//not a comment
                isNull(followedByUser)//not followed
            )
        )
        .orderBy(desc(posts.engagementScore))
        .leftJoin(likes, and(eq(posts.id, likes.postId), eq(likes.userId, user.id)))
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(followedByUser, and(eq(followedByUser.followedId, posts.userId), eq(followedByUser.followerId, user.id)))
        .limit(limit)
        .offset(offset);
}