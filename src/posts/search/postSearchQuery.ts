import { and, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { postsPerRequest } from "../../redis/postFeeds/common"
import { candidateColumns } from "../common"
import { noPending } from "../filters"

export function postSearchQuery({
    text,
    filterUserHandle
}: {
    text?: string,
    filterUserHandle?: string,
}) {
    // Query
    const q = db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(and(
            noPending(),
            text ? sql`to_tsvector('english', ${posts.text}) @@  plainto_tsquery('english', ${text})` : undefined,
            filterUserHandle ? eq(posts.userId, filterUserHandle) : undefined,
        ))
        .limit(postsPerRequest)
        .$dynamic()
    return q
}