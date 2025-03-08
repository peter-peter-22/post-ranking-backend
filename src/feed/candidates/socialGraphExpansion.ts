import { and, desc, inArray } from "drizzle-orm";
import { db } from "../../db";
import { getIndirectFollowedUsers } from "../../db/controllers/users/getIndirectFollowers";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { isPost, minimalEngagement } from "./filters";
import { candidateColumns } from ".";

/** Max count of posts */
const count = 350;

/** Selecting candidate posts from the users those the user follows indirectly.*/
export async function getSocialGraphExpansionCandidates({ user, followedUsers }: { user: User, followedUsers: string[] }) {
    const indirectlyFollowedUsers = await getIndirectFollowedUsers({ followedUsers })
    const candidates = await db
        .select(candidateColumns)
        .from(posts)
        .where(
            and(
                isPost,
                minimalEngagement,
                inArray(posts.userId, indirectlyFollowedUsers),
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
    console.log(`Social graph expansion candidates: ${candidates.length}`)
    return candidates
}