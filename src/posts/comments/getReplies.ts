import { eq } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { CandidateSubquery } from "../common"
import { noPending, replyOfPost } from "../filters"
import { personalizePosts, PersonalPost } from "../hydratePosts"
import { getFollowedComments } from "./sections/followed"
import { getOtherComments } from "./sections/others"
import { getPublisherComments } from "./sections/publisher"
import { postsPerRequest } from "../postMemory"

export async function getReplies(postId: string, user: User, skipIds?: string[]) {
    // Get the main post 
    const post = await getMainPost(postId)
    /** Filters shared by all comment selectors */
    const commonFilters = [
        replyOfPost(post.id),
        noPending()
    ]
    // Assume this is the first page if no comments were displayed so far
    const isFirstPage = !skipIds || skipIds.length === 0

    let candidateSqs:CandidateSubquery[] = isFirstPage ? (
        // If this is the first page, add the replies of the publisher and the followed users
        [
            // The comments of the publisher
            getPublisherComments(post, commonFilters),
            // The comments of followed users 
            getFollowedComments(user, post, commonFilters),
            // Other comments
            getOtherComments(commonFilters, postsPerRequest)
        ]
    ) : (
        // If not the first page, get the other comments
        [getOtherComments(commonFilters, postsPerRequest, skipIds)]
    )

    // Fetch
    const hydrated = await personalizePosts(candidateSqs[0], user)
    // Order (The comments have special ordering)
    return orderReplies(hydrated, post.userId)
}

async function getMainPost(postId: string) {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new Error('Post not found')
    return post
}

/** Order the replies by group then importance */
function orderReplies(replies: PersonalPost[], publisherId: string) {
    return replies.sort((a, b) => {
        // Get the group priorities
        const groupA = getReplyGroup(a, publisherId)
        const groupB = getReplyGroup(b, publisherId)
        // If both comments are from the publisher, order by date
        if (groupA === 2 && groupB === 2) return b.createdAt.getTime() - a.createdAt.getTime()
        // Order by group priority if not equal
        if (groupA !== groupB) return groupB - groupA
        // Order by score if the scores are not equal
        if (a.commentScore !== b.commentScore) return b.commentScore - a.commentScore
        // Order by date otherwise
        return b.createdAt.getTime() - a.createdAt.getTime()
    })
}

/** Return the group priority of a reply. 2=publisher, 1=following, 0=other */
function getReplyGroup(reply: PersonalPost, publisherId: string) {
    return reply.user.id === publisherId ? 2 : reply.user.followed ? 1 : 0
}