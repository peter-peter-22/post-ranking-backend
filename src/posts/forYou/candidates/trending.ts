import { and, arrayOverlaps, desc, notBetween } from "drizzle-orm";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns, DatePageParams } from "../../common";
import { isPost, minimalEngagement, noPending, recencyFilter } from "../../filters";
import { personalizePosts, PersonalPost } from "../../hydratePosts";

/** Selecting candidate posts from trending topics. */
export async function getTrendCandidates({
    trends,
    pageParams,
    user,
    count,
    firstPage
}: {
    trends: string[],
    user: User,
    count: number,
    pageParams?: DatePageParams,
    firstPage: boolean
}) {
    if (!firstPage && !pageParams) return { posts: [] as PersonalPost[] }

    console.log(`Getting post candidates for the following trends: ${trends.join(", ")}`)
    // Get the posts
    const q = db
        .select(candidateColumns("Trending"))
        .from(posts)
        .where(and(
            arrayOverlaps(posts.keywords, trends),
            pageParams && notBetween(posts.createdAt, new Date(pageParams.skipStart), new Date(pageParams.skipEnd)),
            recencyFilter(),
            noPending(),
            isPost(),
            minimalEngagement()
        ))
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