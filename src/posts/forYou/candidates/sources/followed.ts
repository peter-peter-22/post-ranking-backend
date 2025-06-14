import { and, desc, inArray } from "drizzle-orm";
import { db } from "../../../../db";
import { posts } from "../../../../db/schema/posts";
import { isPost, noPending, notDisplayed, recencyFilter } from "../../../filters";
import { candidateColumns } from "../../../common";

/** Max count of posts */
const count = 500;

/** Selecting candidate posts from the users those the viewer follows */
export function getFollowedCandidates({ followedUsers, skipIds }: { followedUsers: string[], skipIds?: string[] }) {
    // Get the posts
    return db
        .select(candidateColumns("Followed"))
        .from(posts)
        .where(
            and(
                recencyFilter(),
                isPost(),
                noPending(),
                notDisplayed(skipIds),
                inArray(posts.userId, followedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
        .$dynamic()
}