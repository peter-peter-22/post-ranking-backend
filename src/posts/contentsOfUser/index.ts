import { and, desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { candidateColumns } from "../common"
import { User } from "../../db/schema/users"
import { noPending, notDisplayed } from "../filters"
import { personalizePosts } from "../hydratePosts"
import { postsPerRequest } from "../postMemory"

export async function getUserContents(userId: string, user: User | undefined, replies: boolean, skipIds?: string[]) {
    return await personalizePosts(userContentCandidates(userId, replies, skipIds), user)
}

/** Get the replies or posts of a user.  */
export function userContentCandidates(userId: string, replies: boolean, skipIds?: string[]) {
    return db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(and(
            eq(posts.userId, userId),
            eq(posts.isReply, replies),
            noPending(),
            notDisplayed(skipIds)
        ))
        .orderBy(desc(posts.createdAt))
        .limit(postsPerRequest)
        .$dynamic()
}