import { and, desc, gt, inArray, lt, or } from "drizzle-orm";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns, DatePageParams } from "../../common";
import { isPost, noPending, recencyFilter } from "../../filters";
import { personalizePosts } from "../../hydratePosts";

/** Selecting candidate posts from the users those the viewer follows */
export async function getFollowedCandidates({
    followedUsers,
    user,
    count,
    pageParams,
    firstPage
}: {
    followedUsers: string[],
    user: User,
    count: number,
    pageParams?: DatePageParams,
    firstPage: boolean
}) {
    if (!firstPage && !pageParams) return

    // Get the posts
    const q = db
        .select(candidateColumns("Followed"))
        .from(posts)
        .where(
            and(
                pageParams && or(
                    gt(posts.createdAt, new Date(pageParams.skipStart)),
                    lt(posts.createdAt, new Date(pageParams.skipEnd))
                ),
                recencyFilter(),
                isPost(),
                noPending(),
                inArray(posts.userId, followedUsers),
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
        .$dynamic()
    const myPosts = await personalizePosts(q, user)

    // Get next page params
    const nextPageParams: DatePageParams | undefined = myPosts.length === count ? {
        skipStart: myPosts[0].createdAt.toISOString(),
        skipEnd: myPosts[myPosts.length - 1].createdAt.toISOString()
    } : undefined
    // Return
    return { posts: myPosts, pageParams: nextPageParams }
}