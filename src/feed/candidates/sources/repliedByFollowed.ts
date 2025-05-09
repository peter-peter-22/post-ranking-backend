import { aliasedTable, and, desc, eq, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from "..";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";

/** Max count of posts */
const count = 200;

/** Selecting posts those were replied by a followed user */
export async function getRepliedByFollowedCandidates({ user, followedUsers, commonFilters }: CandidateCommonData): Promise<CandidatePost[]> {
    const replies = aliasedTable(posts, "replies")

    // Get the followed replies, find posts
    let candidates = await db
        .select(candidateColumns(user))
        .from(replies)
        .where(
            inArray(replies.userId, followedUsers)
        )
        .orderBy(desc(replies.createdAt))
        .innerJoin(posts, and(
            eq(posts.id, replies.replyingTo),
            ...commonFilters,
        ))
        .limit(count)
    console.log(`Replied by followed candidates: ${candidates.length}`)

    // Set the candidate type
    const candidatesWithType = setCandidatesType(candidates, "RepliedByFollowed")

    return candidatesWithType
}