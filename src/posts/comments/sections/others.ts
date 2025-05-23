import { and, desc, notInArray, SQL } from "drizzle-orm";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns } from "../../feed/candidates";

/** Max comments returned per fetch. */
const commentsPerPage=50;

/** Get the rest of the replies.  */
export function getOtherComments(user: User,commonFilters:SQL[],skip:string[]) {
    return db
        .select(candidateColumns(user, "Rest"))
        .from(posts)
        .where(and(
            ...commonFilters,
            // Skip the already seen replies
            notInArray(posts.id,skip)
        ))
        .limit(commentsPerPage)
        .orderBy(desc(posts.commentScore),desc(posts.createdAt))
        .$dynamic()
}