import { and, desc, notInArray, SQL } from "drizzle-orm";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { candidateColumns } from "../../common";

/** Get the rest of the replies.  */
export function getOtherComments(commonFilters: SQL[], limit: number, skip: string[] = []) {
    return db
        .select(candidateColumns("Rest"))
        .from(posts)
        .where(and(
            ...commonFilters,
            // Skip the already seen replies
            notInArray(posts.id, skip)
        ))
        .limit(limit)
        .orderBy(desc(posts.commentScore), desc(posts.createdAt))
        .$dynamic()
}