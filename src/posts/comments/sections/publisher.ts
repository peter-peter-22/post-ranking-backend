import { and, eq, SQL } from "drizzle-orm";
import { db } from "../../../db";
import { Post, posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns } from "../../feed/candidates";

/** Get the replies of the publisher of the post.  */
export function getPublisherComments(user: User, post: Post, commonFilters: SQL[]) {
    return db
        .select(candidateColumns(user, "Publisher"))
        .from(posts)
        .where(and(
            ...commonFilters,
            eq(posts.userId, post.userId)
        ))
        .$dynamic()
}