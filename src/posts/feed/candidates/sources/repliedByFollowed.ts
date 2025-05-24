import { aliasedTable, and, desc, eq, gt, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from "..";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";
import { maxAge } from "../../filters";

/** Max count of posts */
const count = 200;

/** Selecting posts those were replied by a followed user */
export function getRepliedByFollowedCandidates({ followedUsers, commonFilters }: CandidateCommonData) {
    const replies = aliasedTable(posts, "replies")

    // Get the followed replies, find posts
    return db
        .select(candidateColumns("RepliedByFollowed"))
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
        .$dynamic()
}