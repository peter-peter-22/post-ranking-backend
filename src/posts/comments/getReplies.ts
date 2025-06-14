import { eq } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { noPending, replyOfPost } from "../filters"
import { fetchCandidates } from "../forYou/candidates/fetchPosts"
import { PostCandidate } from "../common"
import { hydratePostsWithMeta } from "../hydratePosts"
import { getFollowedComments } from "./sections/followed"
import { getOtherComments } from "./sections/others"
import { getPublisherComments } from "./sections/publisher"

export async function getReplies(postId: string, user: User, skip: string[]) {
    // Get the main post 
    const post = await getMainPost(postId)
    /** Filters shared by all comment selectors */
    const commonFilters = [
        replyOfPost(post.id),
        noPending()
    ]
    // Assume this is the first page if no comments were displayed so far
    const isFirstPage = skip.length === 0
    /** All fetched comments */
    const replies: PostCandidate[] = []
    // If this is the first page, add the replies of the publisher and the followed users
    if (isFirstPage) {
        const [publisherComments, followedComments] = await Promise.all([
            // The comments of the publisher
            fetchCandidates([getPublisherComments(post, commonFilters)]),
            // The comments of followed users 
            fetchCandidates([getFollowedComments(user, post, commonFilters)])
        ])
        replies.push(...publisherComments, ...followedComments)
        skip.push(...replies.map(p => p.id))
    }
    // Get the other replies
    replies.push(...await fetchCandidates([getOtherComments(commonFilters, skip)]))
    // Hydrate
    return hydratePostsWithMeta(replies, user)
}

async function getMainPost(postId: string) {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new Error('Post not found')
    return post
}
