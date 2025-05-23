import { eq, notInArray } from "drizzle-orm"
import { posts } from "../../db/schema/posts"
import { globalFilters } from "../globalFilters"

/** Get the replies of a post. */
const replyOfPost= (postId: string) => {
    return eq(posts.replyingTo, postId)
}

/** Filters shared between reply candidates. */
export const commentsCommonFilters = (postId: string) => [
    ...globalFilters(),
    replyOfPost(postId),
]