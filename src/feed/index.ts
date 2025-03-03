import { aliasedTable, and, desc, eq, exists, getTableColumns, inArray, isNotNull, isNull, like, sql } from "drizzle-orm";
import { db } from "../db";
import { follows } from "../db/schema/follows";
import { likes } from "../db/schema/likes";
import { posts } from "../db/schema/posts";
import { User, users } from "../db/schema/users";

export const scorePerClick = 1
export const scorePerLike = 3
export const scorePerReply = 6

/** Get posts from the main feed of a user. */
export async function getFeed({ user, limit = 50, offset = 0 }: { user: User, limit?: number, offset?: number }) {

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
            globalScore: sql<number>`(
            ${posts.likeCount} * ${scorePerLike}
            +
            ${posts.replyCount} * ${scorePerReply}
            + 
            ${posts.clickCount} * ${scorePerClick}
            +
            EXTRACT(EPOCH FROM (${posts.createdAt} - NOW())) / ${3600}
        )::REAL`.as('global_score'),
            personalScore: sql<number>`(
            CASE WHEN ${isNotNull(followedByUser)} THEN ${200} ELSE 0 END
        )::REAL`.as("personal_score"),
            likedByUser: isNotNull(likes),
            indirectLikes: db.$count(db.select().from(followeds).innerJoin(likes,and(eq(likes.userId,followeds.id),eq(likes.postId,posts.id))).as("followeds_sq"))
        })
        .from(posts)
        .where(isNull(posts.replyingTo))
        .orderBy(desc(sql`global_score`))
        .leftJoin(likes, and(eq(posts.id, likes.postId), eq(likes.userId, user.id)))
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(followedByUser, and(eq(followedByUser.followedId, posts.userId), eq(followedByUser.followerId, user.id)))
        .limit(limit)
        .offset(offset);
}

/** The posts from the main feed of a user in a more readable format.  */
export async function getFeedSimplified({ user }: { user: User }) {
    return (await getFeed({ user })).map(({ likedByUser, likeCount, user: publisher, globalScore, personalScore, topic, viewCount, createdAt, clickCount, indirectLikes }) => ({
        handle: publisher?.handle,
        topic,
        score: globalScore + personalScore,
        globalScore,
        personalScore,
        createdAt: createdAt.getDay(),
        counts: {
            likeCount,
            clickCount,
            viewCount,
        },
        personal: {
            followed: publisher?.followedByUser,
            followedIndirectly: publisher?.followedIndirectly,
            liked: likedByUser,
            indirectLikes
        }
    }))
}