import { User } from "../../db/schema/users"
import { HttpError } from "../../middlewares/errorHandler"
import { PersonalPost } from "../../posts/hydratePosts"
import { redisClient } from "../connect"
import { postFeedTTL } from "./common"

export async function getPaginatedDirectPosts<TPageParams>({
    getMore,
    feedName,
    user,
    offset,
    ttl = postFeedTTL
}: {
    getMore: (pageParams?: TPageParams) => Promise<{ posts: PersonalPost[], pageParams: TPageParams } | undefined>,
    feedName: string,
    user: User,
    offset: number,
    ttl?: number
}) {
    console.log(`Requested direct post feed "${feedName}" for user "${user.id}", offset: ${offset}`)
    const key = `postFeeds/${feedName}/${user.id}`
    // Get the page params
    const pageParams = await getPageParams<TPageParams>(key, ttl, offset)
    // Get the posts for this page
    const data = await getMore(pageParams)
    if (!data) return []
    const { posts, pageParams: newPageParams } = data
    // Update the pageParams
    await redisClient.setEx(key, ttl, JSON.stringify(newPageParams))
    // Return the posts
    return posts
}

async function getPageParams<TPageParams>(key: string, ttl: number, offset: number) {
    // The first page has no page params
    if (offset === 0) return
    // Get the page params from redis
    const data_ = await redisClient.getEx(key, { EX: ttl })
    if (!data_) throw new HttpError(400, "Feed expired")
    // Parse the returned data
    return JSON.parse(data_ as string) as TPageParams
}