import { and, desc, eq, getTableColumns, isNotNull, sql } from "drizzle-orm";
import { db } from "../db";
import { follows } from "../db/schema/follows";
import { likes } from "../db/schema/likes";
import { posts } from "../db/schema/posts";
import { User, users } from "../db/schema/users";

export async function getFeed({ user, limit = 50, offset = 0 }: { user: User, limit?: number, offset?: number }) {
    return await db.select({
        ...getTableColumns(posts),
        user: getTableColumns(users),
        score: sql<number>`(
            ${posts.likeCount}
            + 
            EXTRACT(EPOCH FROM (${posts.createdAt})) / ${3600} - ${480000}
            +
            CASE 
                WHEN ${isNotNull(follows)} THEN 200 
                ELSE 0 
            END
        )`.as('score'),
        likedByUser: isNotNull(likes),
        followedByUser: isNotNull(follows)
    })
        .from(posts)
        .orderBy(desc(sql`score`))
        .leftJoin(likes, and(eq(posts.id, likes.postId), eq(likes.userId, user.id)))
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(follows, and(eq(follows.followedId, posts.userId), eq(follows.followerId, user.id)))
        .limit(limit)
        .offset(offset);
}