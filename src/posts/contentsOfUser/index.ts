import { and, desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { candidateColumns } from "../common"
import { fetchCandidates } from "../forYou/candidates/fetchPosts"
import { hydratePostsWithMeta } from "../hydratePosts"
import { User } from "../../db/schema/users"
import { noPending, notDisplayed } from "../filters"

export async function getUserContents(userId: string, limit: number, user: User|undefined, replies: boolean, skipIds?: string[]) {
    // Get the candidates
    const candidates = await fetchCandidates([
        userContentCandidates(userId, replies, limit, skipIds)
    ])
    // Hydrate
    return await hydratePostsWithMeta(candidates, user)
}

/** Get the replies or posts of a user.  */
export function userContentCandidates(userId: string, replies: boolean, limit: number, skipIds?: string[]) {
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
        .limit(limit)
        .$dynamic()
}