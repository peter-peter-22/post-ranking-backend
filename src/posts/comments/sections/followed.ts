import { and, desc, eq, not, SQL } from "drizzle-orm";
import { db } from "../../../db";
import { Post, posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { follows } from "../../../db/schema/follows";
import { candidateColumns } from "../../common";

/** Get the replies of the followed users.  */
export function getFollowedComments(user: User, post: Post, commonFilters: SQL[]) {
    return db
        .select(candidateColumns("Followed"))
        .from(posts)
        .where(and(
            ...commonFilters,
            // Skip the comments of the poster
            not(eq(posts.userId, post.userId))
        ))
        .innerJoin(follows, and(
            eq(follows.followerId, user.id),
            eq(follows.followedId, posts.userId),
        ))
        .orderBy(desc(posts.commentScore),desc(posts.createdAt))
        .$dynamic()
}