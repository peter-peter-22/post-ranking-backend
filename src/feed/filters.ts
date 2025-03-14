import { gt, gte, isNull, lte, or } from "drizzle-orm";
import { posts } from "../db/schema/posts";

/** Filter out replies. */
export const isPost = () => isNull(posts.replyingTo)

/** Filter out the posts those have a significant amount of views, but no engagement. */
export const minimalEngagement = () => or(gte(posts.engagementScore, 10), lte(posts.viewCount, 20));

/** Filter out the posts those are older than 2 days */
export const recencyFilter = () => {
    // Define the age limit.
    const maxAge = 1000 * 60 * 60 * 24 * 2 // 2 days
    const maxAgeDate = new Date(Date.now() - maxAge)
    
    return gt(posts.createdAt, maxAgeDate)
}

/** The filters those are shared by all candidate selectors. */
export const commonFilters=()=>[
    isPost(),
    recencyFilter(),
]

/** @todo filter out more than 2 posts from the same user */