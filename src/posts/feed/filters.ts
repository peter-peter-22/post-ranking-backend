import { eq, gt, gte, isNotNull, isNull, lte, or } from "drizzle-orm";
import { posts } from "../../db/schema/posts";

/** Filter out replies. */
export const isPost = () => isNull(posts.replyingTo)

/** Filter out replies. */
export const isReply = () => isNotNull(posts.replyingTo)

/** Filter out the posts those have a significant amount of views, but no engagement. */
export const minimalEngagement = () => or(gte(posts.engagementCount, 5), lte(posts.viewCount, 50));

/** Get the date of the max age of the posts. */
export const maxAge = () => {
    const maxAge = 1000 * 60 * 60 * 24 * 2 // 2 days
    return new Date(Date.now() - maxAge)
}

/** Filter out the posts those are older than 2 days */
export const recencyFilter = () => {
    const maxAgeDate =maxAge()
    return gt(posts.createdAt, maxAgeDate)
}

/** Filter out pending posts. */
export const noPending=()=>{
    return eq(posts.pending,false)
}

/** The filters those are shared by all candidate selectors. */
export const commonFilters = () => [
    isPost(),
    recencyFilter(),
    noPending()
]

/** @todo filter out overrepresentation */