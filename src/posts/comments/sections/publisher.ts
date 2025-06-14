import { and, desc, eq, SQL } from "drizzle-orm";
import { db } from "../../../db";
import { Post, posts } from "../../../db/schema/posts";
import { candidateColumns } from "../../common";

/** Get the replies of the publisher of the post.  */
export function getPublisherComments( post: Post, commonFilters: SQL[]) {
    return db
        .select(candidateColumns("Publisher"))
        .from(posts)
        .where(and(
            ...commonFilters,
            eq(posts.userId, post.userId)
        ))
        .orderBy(desc(posts.createdAt))
        .$dynamic()
}