import { and, desc, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from ".";
import { db } from "../../db";
import { getIndirectFollowedUsers } from "../../db/controllers/users/getIndirectFollowers";
import { posts } from "../../db/schema/posts";
import { isPost, minimalEngagement } from "./filters";

/** Max count of posts */
const count = 350;

/** Selecting candidate posts from the users those the user follows indirectly.*/
export async function getSocialGraphExpansionCandidates({user,followedUsers}:CandidateCommonData) {
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