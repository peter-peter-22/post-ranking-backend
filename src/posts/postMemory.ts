import { inArray, like } from "drizzle-orm";
import { db } from "../db";
import { Post, posts } from "../db/schema/posts";
import { redisClient } from "../redis/connect";
import { candidateColumns } from "./common";
import { personalizePosts, PersonalPost } from "./hydratePosts";
import { User } from "../db/schema/users";

export const postsPerRequest = 10
export const minCandidates = 20
export const postFeedTTL = 60 * 10

type PostFeedMeta<TPageParams> = {
    previousPostCount?: number,
    hasMore: boolean,
    pageParams?: TPageParams
}

export async function getPaginatedPosts<TPageParams>({
    getMore,
    feedName,
    user,
    offset,
    minRemaining = minCandidates,
    ttl = postFeedTTL
}: {
    getMore: (pageParams?: TPageParams) => Promise<{ posts: PersonalPost[], pageParams: TPageParams } | undefined>,
    feedName: string,
    user: User,
    offset: number,
    minRemaining?: number,
    ttl?: number
}) {
    console.log(`Requested "${feedName}" for user "${user.id}", offset: ${offset}`)
    const key = `postFeeds/${feedName}/${user.id}`
    const metaKey = key + ":meta"
    const listKey = key + ":list"

    if (offset === 0) {
        const data = await getMore()
        if (!data) {
            console.log("No data fetched")
            return []
        }
        const { posts, pageParams } = data
        console.log(`Fetched ${posts.length} posts.`)
        const returnPosts = posts.slice(0, postsPerRequest)

        if (posts.length === 0) {
            await redisClient.setEx(metaKey, ttl, JSON.stringify({
                hasMore: false,
                pageParams: pageParams
            } satisfies PostFeedMeta<TPageParams>))
            return []
        }

        await redisClient.multi()
            .del(listKey)
            .zAdd(listKey, postsToZSet(posts))
            .expire(listKey, ttl)
            .setEx(metaKey, ttl, JSON.stringify({
                previousPostCount: 0,
                hasMore: true,
                pageParams
            } satisfies PostFeedMeta<TPageParams>))
            .exec()

        return returnPosts
    }
    else {
        let [meta_, postCount_] = await redisClient.multi()
            .get(metaKey)
            .zCard(listKey)
            .exec()
        const meta = JSON.parse(meta_ as string) as PostFeedMeta<TPageParams>
        const postCount = postCount_ as number
        const localOffset = offset - (meta.previousPostCount ?? 0)
        const remaining = postCount - localOffset
        console.log(`Local offset: ${localOffset}, post count: ${postCount}, previous post count: ${meta.previousPostCount ?? 0}, remaining: ${remaining}, has more: ${meta.hasMore}`)
        if (remaining >= minRemaining || !meta.hasMore) {
            const postIds = await redisClient.zRange(listKey, localOffset, localOffset + postsPerRequest - 1)
            console.log(`Loaded ${postIds.length} posts from the list, ${remaining - postIds.length} remains.`)
            return await postsFromIds(postIds, user)
        }
        console.log(`Less posts are remaining than the minimum, ${minRemaining}`)
        if (!meta.hasMore) {
            console.log("No more posts to fetch, end of feed")
            return []
        }
        console.log("Fetching posts with page params:", meta.pageParams)
        const data = await getMore(meta.pageParams)
        if (!data || data.posts.length === 0) {
            console.log("Attempted to fetch posts, but nothing was returned, sending the remaining posts.")
            await redisClient.setEx(metaKey, ttl, JSON.stringify({
                ...meta,
                hasMore: false,
            } satisfies PostFeedMeta<TPageParams>))

            const postIds = await redisClient.zRange(listKey, localOffset, localOffset + postsPerRequest - 1)
            console.log(`Loaded ${postIds.length} posts from the list, ${remaining - postIds.length} remains.`)
            return await postsFromIds(postIds, user)
        }
        const { posts, pageParams } = data
        const newRemaining = posts.length + remaining
        console.log(`Fetched ${posts.length} new posts, ${newRemaining} remains in total`)

        const res = await redisClient.multi()
            .zPopMinCount(listKey, localOffset)
            .zAdd(listKey, postsToZSet(posts))
            .zRange(listKey, 0, postsPerRequest - 1)
            .setEx(metaKey, ttl, JSON.stringify({
                previousPostCount: offset,
                hasMore: true,
                pageParams
            } satisfies PostFeedMeta<TPageParams>))
            .exec()

        const newPostIds = res[2] as string[]
        console.log(`Returning ${newPostIds.length} posts, ${newRemaining - newPostIds.length} remains`)
        return await postsFromIds(newPostIds, user)
    }

}

function postsToZSet(posts: PersonalPost[]) {
    return posts.map(post => ({ value: post.id, score: post.score ?? 0 }))
}

async function postsFromIds(ids: string[], user: User) {
    const postsSq = db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(inArray(posts.id, ids))
        .$dynamic()

    return await personalizePosts(postsSq, user)
}