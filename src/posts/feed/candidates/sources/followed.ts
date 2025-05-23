import { and, desc, eq, inArray } from "drizzle-orm";
import { candidateColumns, CandidateCommonData } from "..";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";
import { users } from "../../../../db/schema/users";

/** Max count of posts */
const count = 500;

/** Selecting candidate posts from the users those the viewer follows */
export function getFollowedCandidates({user, followedUsers, commonFilters }: CandidateCommonData) {
    // Get the posts
    return db
        .select(candidateColumns(user,"Followed"))
        .from(posts)
        .where(
            and(
                ...commonFilters,
                inArray(posts.userId, followedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
        .$dynamic()
}