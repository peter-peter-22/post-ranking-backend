import { aliasedTable, and, desc, eq, gt, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData, CandidatePost, setCandidatesType } from "..";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { maxAge } from "../../../db/controllers/posts/filters";

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
            and(
                inArray(replies.userId, followedUsers), // TODO: this is possibbly not efficient 
                gt(replies.createdAt, maxAge())
            )
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